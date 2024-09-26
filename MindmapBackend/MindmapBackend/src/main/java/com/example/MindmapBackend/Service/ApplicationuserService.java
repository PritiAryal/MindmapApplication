package com.example.MindmapBackend.Service;


import com.example.MindmapBackend.Repository.AccountRepository;
import com.example.MindmapBackend.Repository.ApplicationuserRepository;
import com.example.MindmapBackend.Domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicationuserService {

    @Autowired
    private ApplicationuserRepository applicationuserRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Transactional
    public boolean validateApplicationuserLogin(Login login) {
//        Optional<Applicationuser> applicationuser = applicationuserRepository.findByName(login.getName());
        Optional<Applicationuser> applicationuser = applicationuserRepository.findByNameAndEmail(login.getName(), login.getEmail());



        if (!applicationuser.isPresent()) {
            return false;
        }


        System.out.println("login pass " + login.getPassword());
        System.out.println("database pass " + applicationuser.get().getPassword());

        return login.getPassword().equals(applicationuser.get().getPassword());
    }

    @Transactional(readOnly = true)
    public List<Applicationuser> findAll() {
        return applicationuserRepository.findAll();
    }

    @Transactional (readOnly = true)
    public Applicationuser findApplicationuser(Integer id) {
        return applicationuserRepository.findById(id).orElseThrow(()->new IllegalArgumentException("Check id"));
    }
    @Transactional
    public Applicationuser create(Applicationuser applicationuser){

        return applicationuserRepository.save(applicationuser);
    }




}
