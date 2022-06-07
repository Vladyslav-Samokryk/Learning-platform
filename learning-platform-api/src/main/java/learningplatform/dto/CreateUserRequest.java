package learningplatform.dto;

import lombok.Value;

@Value
public class CreateUserRequest {

    String fullName;
    String email;
    String username;
    String password;

}
