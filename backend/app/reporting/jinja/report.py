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
    def __init__(self, template_name, output_file_name, output_format):
        self.output_format = output_format.lower()
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

    @staticmethod
    def _ensure_extension(file_name, output_format):
        """Append extension if missing"""
        ext = "." + output_format.lower()
        if not file_name.lower().endswith(ext):
            file_name += ext
        return file_name

    @staticmethod
    def used_memory():
        process = psutil.Process(os.getpid())
        return process.memory_info().rss

    def render(self, context: dict):
        start_time = time.perf_counter()
        start_mem = self.used_memory()
        # FILL
        start_fill_time = time.perf_counter()
        start_fill_mem = self.used_memory()
        rendered_content = self.template.render(context)
        end_fill_time = time.perf_counter()
        end_fill_mem = self.used_memory()

        fill_time_ms = (end_fill_time - start_fill_time) * 1000
        fill_memory_used = end_fill_mem - start_fill_mem
        # EXPORT
        start_export_time = time.perf_counter()
        start_export_mem = self.used_memory()
        if self.output_format == "html":
            with open(self.output_file_name, "w", encoding="utf-8") as f:
                f.write(rendered_content)
        elif self.output_format == "pdf":
            pdfkit.from_string(rendered_content, self.output_file_name)

        end_export_time = time.perf_counter()
        end_export_mem = self.used_memory()

        export_time_ms = (end_export_time - start_export_time) * 1000
        export_memory_used = end_export_mem - start_export_mem

        # TOTAL
        end_time = time.perf_counter()
        end_mem = self.used_memory()

        total_time_ms = (end_time - start_time) * 1000
        total_memory_used = end_mem - start_mem

        print("\n--- Jinja2 PERFORMANCE METRICS ---")

        print(f"fill_time_ms: {fill_time_ms:.2f}")
        print(f"fill_memory_used_bytes: {fill_memory_used}")

        print(f"export_time_ms: {export_time_ms:.2f}")
        print(f"export_memory_used_bytes: {export_memory_used}")

        print(f"total_time_ms: {total_time_ms:.2f}")
        print(f"total_memory_used_bytes: {total_memory_used}")

        print("-----------------------------------")

        self.url = f"{BACKEND_URL}/{self.output_file_name}"
