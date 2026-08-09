from collections import defaultdict
from statistics import mean


def summarize_by_multiplier(report_stats: list[dict]) -> dict:
    """Groups report_stats by multiplier, averaging fill/export/total time_ms
    and total memory_used_bytes across all runs at that multiplier."""
    grouped = defaultdict(lambda: {
        "fill_ms": [], "export_ms": [], "total_ms": [], "total_mem": [], "worker_count": None,
    })

    for entry in report_stats:
        multiplier = entry["multiplier"]
        phases = {p.name: p for p in entry["metrics"].phases}

        grouped[multiplier]["fill_ms"].append(phases["fill"].time_ms)
        grouped[multiplier]["export_ms"].append(phases["export"].time_ms)
        grouped[multiplier]["total_ms"].append(phases["total"].time_ms)
        grouped[multiplier]["total_mem"].append(phases["total"].memory_used_bytes)
        grouped[multiplier]["worker_count"] = entry["worker_count"]

    return {
        multiplier: {
            "worker_count": values["worker_count"],
            "avg_fill_ms": mean(values["fill_ms"]),
            "avg_export_ms": mean(values["export_ms"]),
            "avg_total_ms": mean(values["total_ms"]),
            "avg_total_memory_bytes": mean(values["total_mem"]),
        }
        for multiplier, values in grouped.items()
    }


def print_summary(summary: dict) -> None:
    header = f"{'multiplier':>10} {'workers':>8} {'avg_fill_ms':>12} {'avg_export_ms':>14} {'avg_total_ms':>13} {'avg_total_mem_mb':>17}"
    print(header)
    print("-" * len(header))
    for multiplier in sorted(summary.keys()):
        s = summary[multiplier]
        avg_total_mem_mb = s["avg_total_memory_bytes"] / (1024 * 1024)
        print(f"{multiplier:>10} {s['worker_count']:>8} "
              f"{s['avg_fill_ms']:>12.2f} {s['avg_export_ms']:>14.2f} "
              f"{s['avg_total_ms']:>13.2f} {avg_total_mem_mb:>17.2f}")