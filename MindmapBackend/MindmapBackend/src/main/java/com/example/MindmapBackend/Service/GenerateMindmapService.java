package com.example.MindmapBackend.Service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.logging.Logger;

@Service
public class GenerateMindmapService {
    private static final Logger LOGGER = Logger.getLogger(GenerateMindmapService.class.getName());


    public String generateMindmapData(Integer userId, String keyword) throws IOException {
        LOGGER.info("Calling Python script with userId: " + userId + " and keyword: " + keyword);
        //Path to python.exe and the Python script
        ProcessBuilder processBuilder = new ProcessBuilder(
                "C:\\Users\\priti\\Downloads\\GA\\python\\venv\\Scripts\\python.exe",
                "C:\\Users\\priti\\Downloads\\GA\\python\\mindmap_interactive.py",
                userId.toString(),
                keyword
        );

        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }
        LOGGER.info("Python script output: " + output.toString());

        String outputString = output.toString();
        if (outputString.isEmpty()) {
            throw new RuntimeException("Python script returned no output");
        }

        System.out.println("Python script output: " + outputString);
        return outputString;
    }



}


