import time

import psutil
from jinja2 import Template
from bs4 import BeautifulSoup
import os
from datetime import datetime

import pdfkit

from app.constants import BACKEND_URL
from app.core.config import settings
from app.reporting.jinja.utils import get_jinja_environment
from app.reporting.jinja import jinja_measure
from app.reporting.metrics import RenderMetrics


class Report:
    def __init__(self, input_file_path, output_file_name, output_format):
        self.input_file_path = input_file_path
        self.output_format = output_format.lower()

        # Generate timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Construct output file path dynamically
        base_name = os.path.splitext(output_file_name)[0]  # remove any extension
        self.output_file_name = os.path.join(
            settings.reports_dir, f"{base_name}_{timestamp}"
        )
        self.output_file_name = self._ensure_extension(self.output_file_name, self.output_format)
        self.url = ''

        if self.output_format in ["pdf", "html"]:
            # Read input file
            with open(self.input_file_path, "r", encoding="utf-8") as f:
                file_content = f.read()

            # Parse HTML with BeautifulSoup
            soup = BeautifulSoup(file_content, "html.parser")
            input_html_content = str(soup)

            # Pass HTML to Jinja2 Template
            self.template = Template(input_html_content)
        else:
            raise ValueError(f"Unsupported output format: {self.output_format}")


    def _ensure_extension(self, file_name, output_format):
        """Append extension if missing"""
        ext = "." + output_format.lower()
        if not file_name.lower().endswith(ext):
            file_name += ext
        return file_name

    def render(self, context: dict):
        """
        Render the template with the provided context.
        """
        rendered_content = self.template.render(context)

        # Check output type
        if self.output_format == "html":
            # Write HTML file
            with open(self.output_file_name, "w", encoding="utf-8") as f:
                f.write(rendered_content)
        elif self.output_format == "pdf":
            # Convert HTML to PDF using pdfkit
            pdfkit.from_string(rendered_content, self.output_file_name)
        else:
            raise ValueError(f"Unsupported output format: {self.output_format}")

        self.url = f"{BACKEND_URL}/{self.output_file_name}"

class Report_V2:
    def __init__(self, template_name, output_file_name, output_format, measure_memory: bool = True):
        self.output_format = output_format.lower()
        self.measure_memory = measure_memory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(output_file_name)[0]
        self.output_file_name = os.path.join(
            settings.reports_dir, f"{base_name}_{timestamp}"
        )
        self.output_file_name = self._ensure_extension(self.output_file_name, self.output_format)
        self.url = ''

        if self.output_format not in ["pdf", "html"]:
            raise ValueError(f"Unsupported output format: {self.output_format}")

        # use of environment
        env = get_jinja_environment()
        self.template = env.get_template(template_name)
        self.last_metrics = None

    @staticmethod
    def _ensure_extension(file_name, output_format):
        """Append extension if missing"""
        ext = "." + output_format.lower()
        if not file_name.lower().endswith(ext):
            file_name += ext
        return file_name

    def render(self, context: dict, verbose: bool = True) -> "RenderMetrics":
        metrics = RenderMetrics(enabled=self.measure_memory)

        with metrics.phase("total", gc_collect=True) as total:
            # FILL
            with metrics.phase("fill", use_tracemalloc=True) as fill:
                rendered_content = self.template.render(context)
                if self.measure_memory:
                    fill.extra["rendered_content_bytes"] = len(rendered_content.encode("utf-8"))

            # EXPORT
            with metrics.phase("export") as export:
                if self.output_format == "html":
                    with open(self.output_file_name, "w", encoding="utf-8") as f:
                        f.write(rendered_content)
                else:
                    child_monitor = jinja_measure.ChildProcessMonitor() if self.measure_memory else None
                    if child_monitor:
                        child_monitor.start()
                    try:
                        pdfkit.from_string(rendered_content, self.output_file_name)
                    finally:
                        if child_monitor:
                            child_monitor.stop()
                            child_peak = child_monitor.get_peak()
                            export.memory_used_bytes += child_peak
                            export.extra["child_process_peak_bytes"] = child_peak

            # The child PDF process's memory never shows up in this
            # process's own RSS diff, so fold it in explicitly —
            # otherwise "total" understates the real memory cost.
            total.memory_used_bytes += export.extra.get("child_process_peak_bytes", 0)

        if verbose:
            metrics.print_summary("\n--- Jinja2 PERFORMANCE METRICS ---")
        self.last_metrics = metrics
        self.url = f"{BACKEND_URL}/{self.output_file_name}"
        return metrics