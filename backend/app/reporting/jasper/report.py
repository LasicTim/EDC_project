import os
from typing import List

from pyreportjasper import PyReportJasper

from app.core.config import settings


class JasperReport:
    def __init__(self, input_file:str, output_file:str, output_formats:List[str]):
        reports_dir = settings.reports_dir
        self.input_file = os.path.join(reports_dir, input_file)
        self.output_file = os.path.join(reports_dir, output_file)
        self.output_formats = output_formats


        if not self.output_formats and self.output_file and not self.input_file:
            raise ValueError("No output formats specified")

        self.compile_and_process()
        # Build URL (local server for demo purposes)
        self.report_url = f"http://localhost:8000/{output_file}.pdf"

    def compile_and_process(self):
        pyreportjasper = PyReportJasper()
        pyreportjasper.config(
            self.input_file,
            self.output_file,
            output_formats=self.output_formats,
            locale='sl_SI'
        )
        pyreportjasper.compile(write_jasper=True)
        pyreportjasper.process_report()