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
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

// Jackson imports
import com.fasterxml.jackson.databind.ObjectMapper;

// JasperReports imports
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
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

    private long usedMemory() {
        Runtime runtime = Runtime.getRuntime();
        return runtime.totalMemory() - runtime.freeMemory();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        Map<String, Object> metrics = new LinkedHashMap<>();

        try {
            long startTime = System.nanoTime();
            long startMemory = usedMemory();
            // Read request body
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = req.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            logger.info("Received request body: " + sb.toString());

            // Parse JSON using Jackson
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> jsonMap = mapper.readValue(sb.toString(), Map.class);

            // Extract fields
            String templateFile = (String) jsonMap.get("template_file");
            String outputFile = (String) jsonMap.get("output_file");
            Object dataObject = jsonMap.get("data");

            // Convert "data" to JSON string
            String dataJson = mapper.writeValueAsString(dataObject);
            logger.info("Extracted data JSON: " + dataJson);

            InputStream jsonStream = new ByteArrayInputStream(dataJson.getBytes("UTF-8"));

            File template = new File(templateFile);
            if (!template.exists()) {
                logger.severe("JRXML template file not found: " + templateFile);
                jsonStream.close();
                resp.getWriter().write("{\"status\":\"error\",\"message\":\"Template file not found\"}");
                return;
            } else {
                logger.info("JRXML template file found: " + templateFile);
            }

            // Compile template
            long compileStart = System.nanoTime();
            long compileMemoryStart = usedMemory();
            JasperReport jasperReport = null;
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
            } finally {
                jsonStream.close();
            }
            long compileEnd = System.nanoTime();
            long compileMemoryEnd = usedMemory();
            metrics.put("compile_time_ms", (compileEnd - compileStart) / 1_000_000);
            metrics.put("compile_memory_used_bytes", compileMemoryEnd - compileMemoryStart);

            // Create JSON data source (pointing to the "root" array)
            long fillStart = System.nanoTime();
            long fillMemoryStart = usedMemory();
            JsonDataSource dataSource = new JsonDataSource(jsonStream, "root");

            // Fill report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, null, dataSource);
            long fillEnd = System.nanoTime();
            long fillMemoryEnd = usedMemory();
            metrics.put("fill_time_ms", (fillEnd - fillStart) / 1_000_000);
            metrics.put("fill_memory_used_bytes", fillMemoryEnd - fillMemoryStart);
            // Export to PDF
            long exportStart = System.nanoTime();
            long exportMemoryStart = usedMemory();
            JRPdfExporter exporter = new JRPdfExporter();
            exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
            exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputFile));

            SimplePdfExporterConfiguration configuration = new SimplePdfExporterConfiguration();
            exporter.setConfiguration(configuration);
            exporter.exportReport();
            long exportEnd = System.nanoTime();
            long exportMemoryEnd = usedMemory();
            metrics.put("export_time_ms", (exportEnd - exportStart) / 1_000_000);
            metrics.put("export_memory_used_bytes", exportMemoryEnd - exportMemoryStart);

            jsonStream.close();
            long endTime = System.nanoTime();
            long endMemory = usedMemory();
            metrics.put("execution_time_ms", (endTime - startTime) / 1_000_000);
            metrics.put("memory_used_bytes", endMemory - startMemory);
            // Write success response
            out.write("{\"status\":\"success\",\"message\":\"Report generated successfully\", \"metrics\":" + mapper.writeValueAsString(metrics) + "}");

        } catch (Exception e) {
            logger.severe("Exception message: " + e.getMessage());
            // Ensure writer is initialized
            if (out == null) out = resp.getWriter();
            out.write("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}");
        }
    }
}