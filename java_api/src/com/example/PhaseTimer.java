package com.example;

import com.sun.jna.platform.win32.Kernel32;
import oshi.SystemInfo;
import oshi.software.os.OSProcess;
import oshi.software.os.OperatingSystem;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PhaseTimer implements AutoCloseable {
    private static final long SETTLE_MS = 10;
    private static final long SAMPLE_INTERVAL_MS = 10;

    private static final SystemInfo SYSTEM_INFO = new SystemInfo();
    private static final OperatingSystem OS = SYSTEM_INFO.getOperatingSystem();
    private static final int PID = Kernel32.INSTANCE.GetCurrentProcessId();

    private final String name;
    private final List<Map<String, Object>> phases;
    private final boolean gcCollect;
    private final long startTimeNanos;
    private final long startRssBytes;

    private volatile long peakRssBytes;
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
        this.startRssBytes = sampleRss();
        this.peakRssBytes = startRssBytes;

        startSampling();
    }

    public long getPeakMemoryUsedBytes() {
        return peakRssBytes - startRssBytes;
    }

    public void setPeakMemoryUsedBytes(long peakMemoryUsedBytes) {
        this.peakRssBytes = this.startRssBytes + peakMemoryUsedBytes;
    }

    public void putExtra(String key, Object value) {
        extra.put(key, value);
    }

    private void startSampling() {
        sampling = true;

        samplerThread = new Thread(() -> {
            while (sampling) {
                long currentRssBytes = sampleRss();

                if (currentRssBytes > peakRssBytes) {
                    peakRssBytes = currentRssBytes;
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

    private static long sampleRss() {
        OSProcess process = OS.getProcess(PID);

        return process != null ? process.getResidentSetSize() : 0;
    }

    @Override
    public void close() {
        stopSampling();

        long endRssBytes = sampleRss();

        if (endRssBytes > peakRssBytes) {
            peakRssBytes = endRssBytes;
        }

        double elapsedMs = (System.nanoTime() - startTimeNanos) / 1_000_000.0;
        long memoryUsedBytes = endRssBytes - startRssBytes;
        long peakMemoryUsedBytes = getPeakMemoryUsedBytes();

        Map<String, Object> phase = new LinkedHashMap<>();
        phase.put("name", name);
        phase.put("time_ms", Math.round(elapsedMs * 100.0) / 100.0);
        phase.put("memory_used_bytes", memoryUsedBytes);
        phase.put("peak_memory_used_bytes", peakMemoryUsedBytes);
        phase.put("extra", extra);

        phases.add(phase);
    }
}