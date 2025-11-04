package com.example.demo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.Domain.User;
import com.example.demo.Repository.UserRepository;

@Service
public class UserService
{
	@Autowired
	private UserRepository userRepository;

	public User addUser(User user)
	{
		return userRepository.save(user);
	}

	public List<User> getAllUser()
	{
		return userRepository.findAll();
	}
}
