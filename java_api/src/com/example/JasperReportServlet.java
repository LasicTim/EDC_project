package com.example;

// Servlet imports
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Java core imports
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.File;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

// Jackson imports
import com.fasterxml.jackson.databind.ObjectMapper;

// JasperReports imports
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JsonDataSource;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimplePdfExporterConfiguration;

// Logging imports
import java.util.logging.Level;
import java.util.logging.Logger;

public class JasperReportServlet extends HttpServlet {
    private static final Logger logger = Logger.getLogger(JasperReportServlet.class.getName());

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        List<Map<String, Object>> phases = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();

        PhaseTimer compilePhase;
        PhaseTimer fillPhase;
        PhaseTimer exportPhase;

        try {
            // total wraps everything below;
            try (PhaseTimer total = new PhaseTimer("total", phases, true)) {
                // Read request body
                StringBuilder sb = new StringBuilder();
                BufferedReader reader = req.getReader();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                logger.info("Received request body: " + sb.toString());

                // Parse JSON using Jackson
                Map<String, Object> jsonMap = mapper.readValue(sb.toString(), Map.class);

                String templateFile = (String) jsonMap.get("template_file");
                String outputFile = (String) jsonMap.get("output_file");
                Object dataObject = jsonMap.get("data");

                String dataJson = mapper.writeValueAsString(dataObject);
                logger.info("Extracted data JSON: " + dataJson);

                File template = new File(templateFile);
                if (!template.exists()) {
                    logger.severe("JRXML template file not found: " + templateFile);
                    out.write("{\"status\":\"error\",\"message\":\"Template file not found\"}");
                    return;
                }
                logger.info("JRXML template file found: " + templateFile);

                // COMPILE
                JasperReport jasperReport;
                try (PhaseTimer phase = new PhaseTimer("compile", phases)) {
                    logger.info("Compiling JRXML template: " + templateFile);
                    try {
                        String jrxml = Files.readString(Paths.get(templateFile), StandardCharsets.UTF_8);
                        InputStream stream = new ByteArrayInputStream(jrxml.getBytes(StandardCharsets.UTF_8));
                        jasperReport = JasperCompileManager.compileReport(stream);
                        logger.info("Compilation done");
                    } catch (net.sf.jasperreports.engine.JRException jrEx) {
                        logger.log(Level.SEVERE, "JRException compiling report", jrEx);
                        out.write("{\"status\":\"error\",\"message\":\"JRXML compilation failed: " + jrEx.getMessage() + "\"}");
                        return;
                    } catch (IOException ioEx) {
                        logger.log(Level.SEVERE, "IOException reading JRXML file", ioEx);
                        out.write("{\"status\":\"error\",\"message\":\"JRXML file read failed: " + ioEx.getMessage() + "\"}");
                        return;
                    }
                    compilePhase = phase;
                }

                // FILL
                JasperPrint jasperPrint;
                try (PhaseTimer phase = new PhaseTimer("fill", phases);
                     InputStream jsonStream = new ByteArrayInputStream(dataJson.getBytes(StandardCharsets.UTF_8))) {
                    JsonDataSource dataSource = new JsonDataSource(jsonStream, "root");
                    jasperPrint = JasperFillManager.fillReport(jasperReport, null, dataSource);
                    phase.putExtra("page_count", jasperPrint.getPages().size());
                    fillPhase = phase;
                }

                // EXPORT
                try (PhaseTimer phase = new PhaseTimer("export", phases)) {
                    JRPdfExporter exporter = new JRPdfExporter();
                    exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                    exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputFile));
                    exporter.setConfiguration(new SimplePdfExporterConfiguration());
                    exporter.exportReport();
                    exportPhase = phase;
                }

                total.setPeakMemoryUsedBytes(
                    Math.max(
                        compilePhase.getPeakMemoryUsedBytes(),
                        Math.max(fillPhase.getPeakMemoryUsedBytes(),
                                exportPhase.getPeakMemoryUsedBytes())
                    )
                );
            }

            // Only now does `phases` actually contain compile/fill/export/total.
            Map<String, Object> metrics = new LinkedHashMap<>();
            metrics.put("phases", phases);
            out.write("{\"status\":\"success\",\"message\":\"Report generated successfully\",\"metrics\":"
                    + mapper.writeValueAsString(metrics) + "}");

        } catch (Exception e) {
            logger.severe("Exception message: " + e.getMessage());
            out.write("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}");
        }
    }
}