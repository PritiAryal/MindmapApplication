package com.example.MindmapBackend.Service;


import com.example.MindmapBackend.Repository.ApplicationuserRepository;
import com.example.MindmapBackend.Domain.Applicationuser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.security.Key;
import java.util.Date;
import java.util.Optional;

@Service
public class SecurityService {

    private static final String SECRET_KEY = "secretkeadfayyeytereadfadfadadkjaldjalflajdces";

    @Autowired
    private ApplicationuserRepository applicationuserRepository;

    //@Transactional
    private byte[] getSecretKeyBytes() {
        return DatatypeConverter.parseBase64Binary(SECRET_KEY);
    }

    @Transactional
    public String createToken(String subject, long expTime){
        if(expTime <=0){
            throw new RuntimeException("expired");
        }

        SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

        byte[] secretKeyBytes = DatatypeConverter.parseBase64Binary(SECRET_KEY);
        Key signingKey = new SecretKeySpec(secretKeyBytes, signatureAlgorithm.getJcaName());

        return Jwts.builder()
                .setSubject(subject)
                //.claim("applicationuserId", id)
                .signWith(signingKey, signatureAlgorithm)
                .setExpiration(new Date(System.currentTimeMillis() + expTime))
                .compact();
    }

    @Transactional
    public String getSubject(String token){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(DatatypeConverter.parseBase64Binary(SECRET_KEY))
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    @Transactional
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSecretKeyBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();

        String name = claims.getSubject();

        Optional<Applicationuser> applicationuser = applicationuserRepository.findByName(name);
        if (applicationuser.isPresent()) {
            Applicationuser user = applicationuser.get();
            Integer userId = user.getId();
            return "User ID: " + userId;
        } else {
            return "User ID not found for the given name";
        }
    }

}

