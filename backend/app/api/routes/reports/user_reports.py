import os

import ujson
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json


from app.api.schemas import companies
from app.constants import GENERATED_REPORTS_DIR, BACKEND_URL
from app.core.auth import Authenticate
from app.core.config import settings
from app.db.base import get_db
from app.db.models.models import UserModel
from app.reporting.jasper.report import Report_Jasper
from app.reporting.jasper.utils import get_jasper_template_path
from app.reporting.jinja.report import Report, Report_V2
from app.reporting.jinja.utils import get_jinja_template_path, report_stats_to_json_rows, get_jinja_stat_path
from app.utils.company_utils import get_company_workers
from app.reporting.metrics import summarize_by_multiplier, print_summary

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

@router.post("/create_user_reports_v2")
def create_user_reports_v2(company: companies.GetCompany, db: Session = Depends(get_db)):
    try:

        all_workers = get_company_workers(company.IdUser, db)

        template_name = "user_browse.html"
        out_file_name = 'Izpis_delavcev'
        out_file_format = 'pdf'
        report_stats = []
        data_multipliers = [5000] # this multiplies data [2,20,200,2000]
        runs = 10 # 10
        report = None
        for multiplier in data_multipliers:
            for run in range(runs):
                workers = all_workers * multiplier
                report = Report_V2(template_name, out_file_name, out_file_format)
                metrics = report.render({"users": workers }, verbose=False)
                report_stats.append({
                    "run": run,
                    "multiplier": multiplier,
                    "worker_count": len(workers),
                    "metrics": metrics,
                })

        summary = summarize_by_multiplier(report_stats)
        print_summary(summary)

        output_path = get_jinja_stat_path("report_benchmark.json")


        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report_stats_to_json_rows(report_stats), f, indent=4)
        return JSONResponse(content={"status": "success", "url": report.url})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.post("/create_user_reports_jasper")
def create_user_reports_jasper(company: companies.GetCompany, db: Session = Depends(get_db)):
    try:

        all_workers = get_company_workers(company.IdUser, db)

        template_name = get_jasper_template_path("user_browse.jrxml")
        out_file_name = 'Izpis_delavcev'
        out_file_format = 'pdf'

        report_stats = []
        data_multipliers = [2,20,200,2000,15000]  # this multiplies data [2,20,200,2000] ## 100000 dobimo blank
        runs = 10  # 10
        report = None
        status = False
        msg = ''
        for multiplier in data_multipliers:
            for run in range(runs):
                workers = all_workers * multiplier
                report = Report_Jasper(template_name, out_file_name, out_file_format, workers)
                status, msg, metrics = report.generate(verbose=False)
                if not status:
                    continue
                report_stats.append({
                    "run": run,
                    "multiplier": multiplier,
                    "worker_count": len(workers),
                    "metrics": metrics,
                })

        summary = summarize_by_multiplier(report_stats)
        print_summary(summary)

        if status:
            return JSONResponse(content={"status": "success", "url": report.url})
        else:
            return JSONResponse(content={"status": "error", "message": msg})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@router.get("/get_all_reports")
def get_all_reports(current_user: UserModel = Depends(Authenticate.get_current_user)):
    # get all file urls from GENERATED_REPORTS_DIR directory and return them
    reports = []
    for filename in os.listdir(GENERATED_REPORTS_DIR):
        if filename.endswith(".pdf"):
            output_file = f"{settings.reports_dir}/{filename}"
            report = {
                "name": filename,
                "url": f"{BACKEND_URL}/{output_file}"
            }
            reports.append(report)

    return JSONResponse(content={"status": "success", "reports": reports})