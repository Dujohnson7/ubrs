package com.ubrs.ubrs_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:}")
    private String uploadDir;

    @Value("${app.upload.relative-path:uploads/}")
    private String relativeUploadPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "https://*.onrender.com",
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) { 
        if (uploadDir != null && !uploadDir.isEmpty()) {
            String normalizedUploadDir = uploadDir.replace("\\", "/");
            if (!normalizedUploadDir.endsWith("/")) {
                normalizedUploadDir += "/";
            }
            String uploadPath = "file:///" + normalizedUploadDir;
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(uploadPath)
                    .setCachePeriod(3600);  
        } else { 
            String userDir = System.getProperty("user.dir").replace("\\", "/");
            String uploadPath = "file:///" + userDir + "/" + relativeUploadPath;
             

            String classpathPath = "classpath:/" + relativeUploadPath;
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations(uploadPath, classpathPath)
                    .setCachePeriod(3600); 
        }
    }
}