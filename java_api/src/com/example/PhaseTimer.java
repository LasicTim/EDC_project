package com.example;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PhaseTimer implements AutoCloseable {
    private static final MemoryMXBean MEMORY_BEAN = ManagementFactory.getMemoryMXBean();
    private static final long SETTLE_MS = 10;
    private static final long SAMPLE_INTERVAL_MS = 10;

    private final String name;
    private final List<Map<String, Object>> phases;
    private final boolean gcCollect;
    private final long startTimeNanos;
    private final long startHeapUsedBytes;

    private volatile long peakHeapUsedBytes;
    private volatile boolean sampling;

    private Thread samplerThread;

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
        this.peakHeapUsedBytes = this.startHeapUsedBytes;
        startSampling();
    }

    public void putExtra(String key, Object value) {
        extra.put(key, value);
    }

    private void startSampling() {
        sampling = true;

        samplerThread = new Thread(() -> {
            while (sampling) {
                long currentHeapUsedBytes = sampleHeapUsed();

                if (currentHeapUsedBytes > peakHeapUsedBytes) {
                    peakHeapUsedBytes = currentHeapUsedBytes;
                }

                try {
                    Thread.sleep(SAMPLE_INTERVAL_MS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });

        samplerThread.setDaemon(true);
        samplerThread.start();
    }

    private void stopSampling() {
        sampling = false;

        if (samplerThread != null) {
            try {
                samplerThread.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    private void settle() {
        if (!gcCollect) {
            return;
        }
        System.gc();
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
        stopSampling();

        // Capture one final sample as a possible peak.
        long endHeapUsedBytes = sampleHeapUsed();

        if (endHeapUsedBytes > peakHeapUsedBytes) {
            peakHeapUsedBytes = endHeapUsedBytes;
        }
        double elapsedMs = (System.nanoTime() - startTimeNanos) / 1_000_000.0;
        long memoryUsedBytes = endHeapUsedBytes - startHeapUsedBytes;
        long peakMemoryUsedBytes = peakHeapUsedBytes - startHeapUsedBytes;

        Map<String, Object> phase = new LinkedHashMap<>();
        phase.put("name", name);
        phase.put("time_ms", Math.round(elapsedMs * 100.0) / 100.0);
        phase.put("memory_used_bytes", memoryUsedBytes);
        phase.put("peak_memory_used_bytes", peakMemoryUsedBytes);
        phase.put("extra", extra);
        phases.add(phase);
    }
}