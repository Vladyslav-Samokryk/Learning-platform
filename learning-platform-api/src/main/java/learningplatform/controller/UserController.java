package learningplatform.controller;

import learningplatform.dto.CreateUserRequest;
import learningplatform.entity.User;
import learningplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.support.SelfLinkProvider;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.net.URI;

@RepositoryRestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final SelfLinkProvider selfLinkProvider;

    @PostMapping("/users")
    public ResponseEntity<?> postUsers(@RequestBody CreateUserRequest createUserRequest) {
        User user = userService.createUser(createUserRequest);
        URI selfLink = selfLinkProvider.createSelfLinkFor(user).toUri();
        return ResponseEntity.created(selfLink).build();
    }

}
