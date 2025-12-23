import json
import os
import tempfile
from typing import List, Any, Dict

from pyreportjasper import PyReportJasper

from app.core.config import settings


class JasperReport:
    def __init__(self, input_file:str, output_file:str, output_formats:List[str], report_type: str, data:List[Any],
                 json_query:str=None):
        reports_dir = settings.reports_dir
        self.input_file = os.path.join(reports_dir, input_file)
        self.output_file = os.path.join(reports_dir, output_file)
        self.output_formats = output_formats
        self.type = report_type
        self.data = data
        self.json_query = json_query

        if not self.output_formats or not self.output_file or not self.input_file or not self.type or not self.data:
            raise ValueError("Invalid JasperReport configuration")

        self.compile_and_process()
        # Build URL (local server for demo purposes)
        self.report_url = f"http://localhost:8000/{output_file}.pdf"

    def compile_and_process(self):
        report_types = {
            "json": lambda x: self.use_json_report(self.data),
        }

        create_report_fn = report_types.get(self.type)
        if create_report_fn:
            create_report_fn(self.data)



    def use_json_report(self, data:List[Any]):
        pyreportjasper = PyReportJasper()
        with tempfile.NamedTemporaryFile(mode="w+", suffix=".json", delete=True) as tmp:
            json.dump(data, tmp)
            tmp.flush()  # Ensure data is written to disk

            # Pass tmp.name to your JasperReport
            con = {
                "driver": "json",
                "data_file": tmp.name,
                "json_query": self.json_query
            }
            pyreportjasper.config(
                self.input_file,
                self.output_file,
                output_formats=self.output_formats,
                locale='sl_SI',
                db_connection=con
            )
            pyreportjasper.compile(write_jasper=True)
            pyreportjasper.process_report()
