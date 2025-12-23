from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
import os
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import get_db
from app.utils.time import current_datetime

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)


@router.post("/create_user_reports")
def create_user_reports(db: Session = Depends(get_db)):
    try:
        from app.reporting.jasper.report import JasperReport

        # Example: generate PDF using JasperPy
        timestamp = current_datetime().strftime("%Y%m%d%H%M%S")
        output_file = os.path.join(settings.reports_dir, f"user_report_{timestamp}")


        data = [
            {
                "Name": "Tim",
                "Score": "4"
            },
            {
                "Name": "Tim1",
                "Score": "5"
            }
        ]

        jasper_report = JasperReport(input_file='simple_report.jrxml', output_file=output_file, output_formats=["pdf"],
                                     report_type="json", data=data)
        report_url = jasper_report.report_url

        return JSONResponse(content={"status": "success", "url": report_url})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
