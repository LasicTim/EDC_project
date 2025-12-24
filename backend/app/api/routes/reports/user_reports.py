from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.schemas import companies
from app.db.base import get_db
from app.reporting.jinja.report import Report
from app.reporting.jinja.utils import get_jinja_template_path
from app.utils.company_utils import get_company_workers

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)


@router.post("/create_user_reports")
def create_user_reports(company: companies.GetCompany, db: Session = Depends(get_db)):
    try:

        all_workers = get_company_workers(company.IdUser,db)

        input_file = get_jinja_template_path("user_browse.html")
        out_file_name = 'Izpis_delavcev'
        out_file_format = 'pdf'

        report = Report(input_file, out_file_name, out_file_format)
        report.render({"users": all_workers})
        # after rendering it should be saved in correct directory
        report_url = report.url


        return JSONResponse(content={"status": "success", "url": report_url})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
