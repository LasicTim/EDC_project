 
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Dict, List
import app.reporting.jinja.jinja_measure as jinja_measure


@dataclass
class PhaseStats:
    name: str
    time_ms: float = 0.0
    memory_used_bytes: int = 0
    extra: Dict[str, object] = field(default_factory=dict)

    def print(self) -> None:
        print(f"\n[{self.name}]")
        print(f"  time_ms: {self.time_ms:.2f}")
        print(f"  memory_used_bytes: {self.memory_used_bytes}")
        for key, value in self.extra.items():
            print(f"  {key}: {value}")


class RenderMetrics:
    """Collects per-phase timing/memory stats and prints a summary report."""

    def __init__(self, enabled: bool):
        self.enabled = enabled
        self.phases: List[PhaseStats] = []

    @contextmanager
    def phase(self, name: str, gc_collect: bool = False, use_tracemalloc: bool = False):
        """Times a block of code and records its RSS delta, if enabled.

        gc_collect=True gives a more accurate (but slower, ~150-200ms) reading
        by forcing GC + a settle sleep before/after. Reserved phase total

        use_tracemalloc=True adds byte-accurate Python-object tracking for
        this phase only. RSS is page-granular (~4KB on Linux) and won't move
        for small allocations, used for small/fast phases like fill.
        """
        stats = PhaseStats(name=name)
        start_time = time.perf_counter()
        settle = 0.01 if gc_collect else 0.0
        start_rss = jinja_measure.sample_rss(gc_collect=gc_collect, settle_time=settle) if self.enabled else 0

        tracemalloc_ctx = (
            jinja_measure.tracemalloc_session() if (self.enabled and use_tracemalloc) else _null_tracemalloc_session()
        )
        with tracemalloc_ctx as get_traced:
            try:
                yield stats
            finally:
                stats.time_ms = (time.perf_counter() - start_time) * 1000
                if self.enabled:
                    end_rss = jinja_measure.sample_rss(gc_collect=gc_collect, settle_time=settle)
                    stats.memory_used_bytes += end_rss - start_rss
                    if use_tracemalloc:
                        current, peak = get_traced()
                        stats.extra["tracemalloc_current_bytes"] = current
                        stats.extra["tracemalloc_peak_bytes"] = peak
                self.phases.append(stats)

    def print_summary(self) -> None:
        print("\n--- Jinja2 PERFORMANCE METRICS ---")
        for phase_stats in self.phases:
            phase_stats.print()
        print("-----------------------------------")

@contextmanager
def _null_tracemalloc_session():
    """Stand-in for jinja_measure.tracemalloc_session() when metrics are off."""
    yield lambda: (0, 0)