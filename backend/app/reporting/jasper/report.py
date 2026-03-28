import os
from datetime import datetime

from app.constants import GENERATED_REPORTS_DIR, BACKEND_URL
from app.core.config import settings
import requests



class Report_Jasper:
    def __init__(self, template_file, output_file, output_format, json_data):
        self.template_name = template_file
        self.output_format = output_format
        self.json_data = json_data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(output_file)[0]
        self.output_file_name = os.path.join(
            settings.reports_dir, f"{base_name}_jasper_{timestamp}.{output_format}"
        )
        self.output_file = os.path.join(
            GENERATED_REPORTS_DIR, f"{base_name}_jasper_{timestamp}.{output_format}"
        )
        self.url = ''

        if self.output_format not in ["pdf", "html"]:
            raise ValueError(f"Unsupported output format: {self.output_format}")


    def generate(self):
        """
        Sends request to Java API and generates the report.
        Returns: (status: bool, message: str)
        """
        try:
            payload = {
                "template_file": self.template_name,
                "output_file": self.output_file,
                "data": {
                    "root": self.json_data
                }
            }

            response = requests.post(settings.java_api_url, json=payload, timeout=30)
            response.raise_for_status()

            resp_json = response.json()
            if resp_json.get("status") == "success":
                self.url = f"{BACKEND_URL}/{self.output_file_name}"
                return True, "Report generated successfully"
            else:
                return False, resp_json.get("message", "Unknown error from Java API")

        except requests.RequestException as e:
            return False, f"Request to Java API failed: {str(e)}"