"""jinja_measure.py — utilities for measuring Jinja2 render performance."""

import gc
import os
import time
import threading
import tracemalloc
from contextlib import contextmanager
from typing import Optional, Callable, Iterator

import psutil


def sample_rss(gc_collect: bool = False, settle_time: float = 0.0) -> int:
    """Current process RSS in bytes.

    gc_collect/settle_time default OFF: this gets called multiple times per
    render, and gc.collect() + sleep cost adds up

    gc_collect is used for phase "total" or per render method call
    """
    if gc_collect:
        gc.collect()
    if settle_time:
        time.sleep(settle_time)
    try:
        return psutil.Process(os.getpid()).memory_info().rss
    except psutil.Error:
        return 0


@contextmanager
def tracemalloc_session() -> Iterator[Callable[[], tuple[int, int]]]:
    """Context manager wrapping a single tracemalloc run.

    Yields a zero-arg callable that returns the (current, peak) bytes traced
    so far. Used for small phases like "fill"
    """
    tracemalloc.start()
    try:
        yield lambda: tracemalloc.get_traced_memory()
    finally:
        tracemalloc.stop()


class ChildProcessMonitor:
    """Polls RSS of all child processes in the background and tracks the peak.

    Useful for tools like wkhtmltopdf that shell out to a child process whose
    memory usage wouldn't otherwise show up in this process's RSS.
    """

    def __init__(self, poll_interval: float = 0.05):
        self.poll_interval = poll_interval
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._peak_rss = 0

    def start(self) -> None:
        self._thread = threading.Thread(target=self._poll_loop, daemon=True)
        self._thread.start()

    def stop(self, timeout: float = 5.0) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout)

    def get_peak(self) -> int:
        return self._peak_rss

    def _poll_loop(self) -> None:
        parent = psutil.Process(os.getpid())
        while not self._stop_event.is_set():
            for child in self._safe_children(parent):
                try:
                    self._peak_rss = max(self._peak_rss, child.memory_info().rss)
                except psutil.Error:
                    pass
            time.sleep(self.poll_interval)

    @staticmethod
    def _safe_children(parent: "psutil.Process"):
        try:
            return parent.children(recursive=True)
        except psutil.Error:
            return []


__all__ = [
    "sample_rss",
    "tracemalloc_session",
    "ChildProcessMonitor",
]