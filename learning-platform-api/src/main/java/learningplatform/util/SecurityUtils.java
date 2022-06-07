package learningplatform.util;

import learningplatform.entity.User;
import learningplatform.entity.User.Role;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public static boolean hasRole(Role role) {
        return getCurrentUser().getRole().equals(role);
    }

    public static boolean isTeacher() {
        return hasRole(Role.TEACHER);
    }

    private SecurityUtils() {
    }

}
