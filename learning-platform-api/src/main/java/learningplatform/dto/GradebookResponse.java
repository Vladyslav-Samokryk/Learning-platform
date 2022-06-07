package learningplatform.dto;

import lombok.Value;

import java.util.List;

@Value
public class GradebookResponse {

    List<String> assignments;

    List<StudentGrades> students;

    @Value
    public static class StudentGrades {

        String fullName;

        List<Integer> grades;

    }

}
