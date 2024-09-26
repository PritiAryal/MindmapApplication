package com.example.MindmapBackend.Controller;

import com.example.MindmapBackend.Repository.ApplicationuserRepository;
import com.example.MindmapBackend.Service.ApplicationuserService;
import com.example.MindmapBackend.Service.SecurityService;
import com.example.MindmapBackend.Domain.Applicationuser;
import com.example.MindmapBackend.Domain.Login;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/*@RestController*/
@Controller
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/mindmaps")
public class ApplicationuserController {

    @Autowired
    private ApplicationuserService applicationuserService;

    @Autowired
    private ApplicationuserRepository applicationuserRepository;

    @Autowired
    private SecurityService securityService;

    @PostMapping("/applicationuser")
    public ResponseEntity<?> save(@RequestBody Applicationuser applicationuser){

        return new ResponseEntity<>(applicationuserService. create(applicationuser), HttpStatus.CREATED);
    }

     @GetMapping("/applicationuser")
     public ResponseEntity<?> findAll(){
         return new ResponseEntity<>(applicationuserService.findAll(), HttpStatus.OK);
     }
    @GetMapping("/applicationuser/{applicationuserId}")
    public ResponseEntity<?> findApplicationuser(@PathVariable Integer applicationuserId){

        return new ResponseEntity<>(applicationuserService.findApplicationuser(applicationuserId), HttpStatus.OK);
    }




    //    public ResponseEntity<Object> validateUserLogin(@RequestBody Login login) {
    @PostMapping(path = "/login")
    @CrossOrigin
    public ResponseEntity<Map<String,Object>> validateUserLogin(@RequestBody Login login) {
        System.out.println("Login Server TEST");
        System.out.println(login.getName());
        System.out.println(login.getEmail());
        System.out.println(login.getPassword());


        String token = securityService.createToken(login.getName(), (36*10000*10));//1*10000*10
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("token", token);

        System.out.println("validation" + applicationuserService.validateApplicationuserLogin(login));

        if (applicationuserService.validateApplicationuserLogin(login)) {
            return ResponseEntity.status(200).body(map);
        }
        return ResponseEntity.status(400).body(null);

    }



    @PostMapping(path = "/loggedInApplicationuser")
    public ResponseEntity<?> loggedInApplicationuser(@RequestHeader("Authorization") String tokenHeader) {
        if (tokenHeader != null && tokenHeader.startsWith("Bearer ")) {
            String token = tokenHeader.substring(7);
            System.out.println("Received token: " + token);

            String userId = securityService.getUserIdFromToken(token);
            if (userId != null) {
                System.out.println("Extracted user ID: " + userId);
                // Extracting the actual user ID from the string "User ID: 1"
                String extractedUserId = userId.split(":")[1].trim(); // Assuming the ID comes after the colon and might have leading/trailing spaces

                Map<String, String> response = new HashMap<>();
                response.put("message", "User ID extracted from token");
                response.put("userID", extractedUserId);
                return ResponseEntity.ok(response);
            } else {
                System.out.println("Error extracting user ID from token");
                return ResponseEntity.badRequest().body("Error extracting user ID from token");
            }
        } else {
            System.out.println("Invalid or missing token");
            return ResponseEntity.badRequest().body("Invalid or missing token");
        }
    }


}
