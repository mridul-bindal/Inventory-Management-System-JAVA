package com.example.demo.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Domain.User;
import com.example.demo.Service.UserService;

@RestController
public class UserController
{

	@Autowired
	private UserService userService;

	@PostMapping("/addUser")
	public User addUser(@RequestBody User user)
	{
		return userService.addUser(user);
	}

	@GetMapping("/getAllUser")
	public List<User> getAllUser()
	{
		return userService.getAllUser();
	}
}
