package com.example;

import java.io.IOException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;

public class JasperServlet extends HttpServlet {

    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("text/plain");
        resp.getWriter().write("Hello world!");
    }
}