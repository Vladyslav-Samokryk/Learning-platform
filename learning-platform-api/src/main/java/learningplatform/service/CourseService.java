package learningplatform.service;

import learningplatform.dto.CreateCourseItemRequest;
import learningplatform.dto.CreateCourseRequest;
import learningplatform.dto.GradebookResponse;
import learningplatform.dto.GradebookResponse.StudentGrades;
import learningplatform.entity.Assignment;
import learningplatform.entity.Course;
import learningplatform.entity.CourseItem;
import learningplatform.entity.Lecture;
import learningplatform.entity.Solution;
import learningplatform.repository.CourseItemRepository;
import learningplatform.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    private final CourseItemRepository courseItemRepository;

    public Course createCourse(CreateCourseRequest createCourseRequest) {
        Course course = new Course();
        course.setTitle(createCourseRequest.getTitle());
        course.setDescription(createCourseRequest.getDescription());
        course.setCreatedAt(Instant.now());
        return courseRepository.save(course);
    }

    public CourseItem createCourseItem(UUID courseId, CreateCourseItemRequest createCourseItemRequest) {
        Course course = findById(courseId);
        CourseItem courseItem;
        if (createCourseItemRequest.getItemType().equals("lecture")) {
            courseItem = new Lecture();
        } else if (createCourseItemRequest.getItemType().equals("assignment")) {
            courseItem = new Assignment();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        courseItem.setTitle(createCourseItemRequest.getTitle());
        courseItem.setContent(createCourseItemRequest.getContent());
        courseItem.setCreatedAt(Instant.now());
        course.addItem(courseItem);
        return courseItemRepository.save(courseItem);
    }

    public GradebookResponse getGrades(UUID courseId) {
        Course course = findById(courseId);
        List<Assignment> assignments = course.getItems().stream()
                .filter(item -> item instanceof Assignment)
                .map(item -> (Assignment) item)
                .collect(Collectors.toList());
        List<StudentGrades> grades = course.getStudents().stream()
                .map(student -> new StudentGrades(
                                student.getFullName(),
                                assignments.stream()
                                        .map(assignment -> assignment.getSolutions().stream()
                                                .filter(solution -> solution.getStudent().equals(student))
                                                .findAny()
                                                .map(Solution::getGrade)
                                                .orElse(null))
                                        .collect(Collectors.toList())
                        )
                )
                .collect(Collectors.toList());
        return new GradebookResponse(
                assignments.stream()
                        .map(Assignment::getTitle)
                        .collect(Collectors.toList()),
                grades);
    }

    public Course findById(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

}
