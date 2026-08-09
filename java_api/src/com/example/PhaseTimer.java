package com.example;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PhaseTimer implements AutoCloseable {
    private static final MemoryMXBean MEMORY_BEAN = ManagementFactory.getMemoryMXBean();
    private static final long SETTLE_MS = 10;

    private final String name;
    private final List<Map<String, Object>> phases;
    private final boolean gcCollect;
    private final long startTimeNanos;
    private final long startHeapUsedBytes;
    private final Map<String, Object> extra = new LinkedHashMap<>();

    public PhaseTimer(String name, List<Map<String, Object>> phases) {
        this(name, phases, false);
    }

    public PhaseTimer(String name, List<Map<String, Object>> phases, boolean gcCollect) {
        this.name = name;
        this.phases = phases;
        this.gcCollect = gcCollect;
        settle();
        this.startTimeNanos = System.nanoTime();
        this.startHeapUsedBytes = sampleHeapUsed();
    }

    public void putExtra(String key, Object value) {
        extra.put(key, value);
    }

    private void settle() {
        if (!gcCollect) {
            return;
        }
        System.gc(); // explicit call — most collectors (incl. G1) treat this as a real, synchronous full GC, unlike incidental young-gen collections
        try {
            Thread.sleep(SETTLE_MS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static long sampleHeapUsed() {
        return MEMORY_BEAN.getHeapMemoryUsage().getUsed();
    }

    @Override
    public void close() {
        settle();
        double elapsedMs = (System.nanoTime() - startTimeNanos) / 1_000_000.0;
        long memoryUsedBytes = sampleHeapUsed() - startHeapUsedBytes;

        Map<String, Object> phase = new LinkedHashMap<>();
        phase.put("name", name);
        phase.put("time_ms", Math.round(elapsedMs * 100.0) / 100.0);
        phase.put("memory_used_bytes", memoryUsedBytes);
        phase.put("extra", extra);
        phases.add(phase);
    }
}