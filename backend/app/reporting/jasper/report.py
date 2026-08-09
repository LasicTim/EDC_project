import os
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import requests

from app.constants import GENERATED_REPORTS_DIR, BACKEND_URL
from app.core.config import settings
from app.reporting.metrics import RenderMetrics


class Report_Jasper:
    def __init__(
            self,
            template_file_path: str,
            output_file_name: str,
            output_format: str,
            data: List[Dict[str, Any]]
    ) -> None:
        self.template_file_path = template_file_path
        self.output_format = output_format
        self.data = data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(output_file_name)[0]
        self.output_file_name = os.path.join(
            settings.reports_dir, f"{base_name}_jasper_{timestamp}.{output_format}"
        )
        self.output_file_path = os.path.join(
            GENERATED_REPORTS_DIR, f"{base_name}_jasper_{timestamp}.{output_format}"
        )
        self.url = ""
        self.last_metrics: Optional[RenderMetrics] = None

        if self.output_format not in ["pdf", "html"]:
            raise ValueError(f"Unsupported output format: {self.output_format}")

    def generate(self, verbose: bool = True) -> Tuple[bool, str, Optional[RenderMetrics]]:
        """Sends request to Java API and generates the report.
        Returns: (status, message, metrics) — metrics is None on failure.
        """
        try:
            payload = {
                "template_file": self.template_file_path,
                "output_file": self.output_file_path,
                "data": {"root": self.data},
            }

            response = requests.post(settings.java_api_url, json=payload, timeout=30)
            response.raise_for_status()
            resp_json = response.json()

            if resp_json.get("status") != "success":
                return False, resp_json.get("message", "Unknown error from Java API"), None

            phases_json = resp_json.get("metrics", {}).get("phases", [])
            metrics = RenderMetrics.from_json_phases(phases_json)
            self.last_metrics = metrics

            if verbose:
                metrics.print_summary(title="Jasper PERFORMANCE METRICS")

            self.url = f"{BACKEND_URL}/{self.output_file_name}"
            return True, "Report generated successfully", metrics

        except requests.RequestException as e:
            return False, f"Request to Java API failed: {str(e)}", None