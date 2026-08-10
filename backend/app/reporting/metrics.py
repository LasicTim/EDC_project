import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
import app.reporting.jinja.jinja_measure as jinja_measure
from collections import defaultdict
from statistics import mean
import threading

@dataclass
class PhaseStats:
    name: str
    time_ms: float = 0.0
    memory_used_bytes: int = 0
    peak_memory_used_bytes: int = 0
    extra: Dict[str, object] = field(default_factory=dict)

    def print(self) -> None:
        print(f"\n[{self.name}]")
        print(f"  time_ms: {self.time_ms:.2f}")
        print(f"  memory_used_bytes: {self.memory_used_bytes}")
        print(f"  peak_memory_used_bytes: {self.peak_memory_used_bytes}")
        for key, value in self.extra.items():
            print(f"  {key}: {value}")


class RenderMetrics:
    """Collects per-phase timing/memory stats and prints a summary report."""

    def __init__(self, enabled: bool):
        self.enabled = enabled
        self.phases: List[PhaseStats] = []

    @contextmanager
    def phase(self, name: str, gc_collect: bool = False, use_tracemalloc: bool = False):
        """Times a block of code and records RSS delta and peak RSS, if enabled."""
        stats = PhaseStats(name=name)
        start_time = time.perf_counter()
        settle = 0.01 if gc_collect else 0.0

        start_rss = (
            jinja_measure.sample_rss(gc_collect=gc_collect, settle_time=settle)
            if self.enabled
            else 0
        )

        peak_rss = start_rss
        stop_event = threading.Event()

        def monitor_rss():
            nonlocal peak_rss
            while not stop_event.is_set():
                current_rss = jinja_measure.sample_rss()
                peak_rss = max(peak_rss, current_rss)
                time.sleep(0.01)

        monitor_thread = None
        if self.enabled:
            monitor_thread = threading.Thread(target=monitor_rss, daemon=True)
            monitor_thread.start()

        tracemalloc_ctx = (
            jinja_measure.tracemalloc_session()
            if (self.enabled and use_tracemalloc)
            else _null_tracemalloc_session()
        )

        with tracemalloc_ctx as get_traced:
            try:
                yield stats
            finally:
                stop_event.set()
                if monitor_thread:
                    monitor_thread.join()
                stats.time_ms = (time.perf_counter() - start_time) * 1000
                if self.enabled:
                    end_rss = jinja_measure.sample_rss(
                        gc_collect=gc_collect,
                        settle_time=settle
                    )
                    stats.memory_used_bytes = end_rss - start_rss
                    stats.peak_memory_used_bytes = peak_rss - start_rss
                    if use_tracemalloc:
                        current, peak = get_traced()
                        stats.extra["tracemalloc_current_bytes"] = current
                        stats.extra["tracemalloc_peak_bytes"] = peak
                        # Use the larger of RSS peak and Python allocation peak.
                        stats.peak_memory_used_bytes = max(
                            stats.peak_memory_used_bytes,
                            peak
                        )
                self.phases.append(stats)

    @classmethod
    def from_json_phases(cls, phases_json: List[Dict[str, Any]]) -> "RenderMetrics":
        """Builds a RenderMetrics from a list of phase dicts shaped like
        {"name": ..., "time_ms": ..., "memory_used_bytes": ..., "extra": {...}}
        — the format the Jasper Java API returns. Lets Jasper reports use the
        exact same print_summary()/summarize_by_multiplier() as Jinja ones.
        """
        metrics = cls(enabled=True)
        for phase_json in phases_json:
            metrics.phases.append(PhaseStats(
                name=phase_json["name"],
                time_ms=phase_json.get("time_ms", 0.0),
                memory_used_bytes=phase_json.get("memory_used_bytes", 0),
                peak_memory_used_bytes=phase_json.get("peak_memory_used_bytes", 0),
                extra=phase_json.get("extra") or {},
            ))
        return metrics

    def print_summary(self, title: Optional[str] = None) -> None:
        if not title:
            title = ""
        print(title)
        for phase_stats in self.phases:
            phase_stats.print()
        print("-----------------------------------")


@contextmanager
def _null_tracemalloc_session():
    """Stand-in for jinja_measure.tracemalloc_session() when metrics are off."""
    yield lambda: (0, 0)

def summarize_by_multiplier(report_stats: list[dict]) -> dict:
    """Groups report_stats by multiplier, averaging fill/export/total time_ms
    and total memory_used_bytes across all runs at that multiplier."""
    grouped = defaultdict(lambda: {
        "fill_ms": [], "export_ms": [], "compile_ms": [], "total_ms": [], "fill_mem": [], "total_mem": [], "worker_count": None,
    })

    for entry in report_stats:
        multiplier = entry["multiplier"]
        phases = {p.name: p for p in entry["metrics"].phases}

        grouped[multiplier]["fill_ms"].append(phases["fill"].time_ms)
        grouped[multiplier]["fill_mem"].append(phases["fill"].peak_memory_used_bytes)
        grouped[multiplier]["export_ms"].append(phases["export"].time_ms)
        if phases.get("compile"):
            grouped[multiplier]["compile_ms"].append(phases["compile"].time_ms)
        else:
            grouped[multiplier]["compile_ms"].append(0)
        grouped[multiplier]["total_ms"].append(phases["total"].time_ms)
        grouped[multiplier]["total_mem"].append(phases["total"].peak_memory_used_bytes)
        grouped[multiplier]["worker_count"] = entry["worker_count"]

    return {
        multiplier: {
            "worker_count": values["worker_count"],
            "avg_fill_ms": mean(values["fill_ms"]),
            "avg_export_ms": mean(values["export_ms"]),
            "avg_compile_ms": mean(values["compile_ms"]),
            "avg_total_ms": mean(values["total_ms"]),
            "avg_fill_peak_memory_bytes": mean(values["fill_mem"]),
            "avg_total_peak_memory_bytes": mean(values["total_mem"]),
        }
        for multiplier, values in grouped.items()
    }


def print_summary(summary: dict) -> None:
    header = f"{'multiplier':>10} {'workers':>8} {'avg_fill_ms':>12} {'avg_compile_ms':>16} {'avg_export_ms':>14} {'avg_total_ms':>13} {'fill_peak_mem_mb':>17} {'avg_total_peak_mem_mb':>17}"
    print(header)
    print("-" * len(header))
    for multiplier in sorted(summary.keys()):
        s = summary[multiplier]
        avg_total_mem_mb = s["avg_total_peak_memory_bytes"] / (1024 * 1024)
        avg_fill_mem_mb = s["avg_fill_peak_memory_bytes"] / (1024 * 1024)
        print(f"{multiplier:>10} {s['worker_count']:>8} "
              f"{s['avg_fill_ms']:>12.2f} {s['avg_compile_ms']:>17.2f} {s['avg_export_ms']:>14.2f} "
              f"{s['avg_total_ms']:>13.2f} {avg_fill_mem_mb:>17.2f} {avg_total_mem_mb:>17.2f}")