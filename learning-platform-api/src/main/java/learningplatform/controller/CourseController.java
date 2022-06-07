package learningplatform.controller;

import learningplatform.dto.CreateCourseItemRequest;
import learningplatform.dto.CreateCourseRequest;
import learningplatform.dto.GradebookResponse;
import learningplatform.entity.Course;
import learningplatform.entity.CourseItem;
import learningplatform.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.support.SelfLinkProvider;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.net.URI;
import java.util.UUID;

@RepositoryRestController
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    private final SelfLinkProvider selfLinkProvider;

    @PostMapping("/courses")
    public ResponseEntity<?> postCourses(@RequestBody CreateCourseRequest createCourseRequest) {
        Course course = courseService.createCourse(createCourseRequest);
        URI selfLink = selfLinkProvider.createSelfLinkFor(course).toUri();
        return ResponseEntity.created(selfLink).build();
    }

    @PostMapping("/courses/{courseId}/items")
    public ResponseEntity<?> postItems(@PathVariable UUID courseId,
            @RequestBody CreateCourseItemRequest createCourseItemRequest) {
        CourseItem courseItem = courseService.createCourseItem(courseId, createCourseItemRequest);
        URI selfLink = selfLinkProvider.createSelfLinkFor(courseItem).toUri();
        return ResponseEntity.created(selfLink).build();
    }

    @GetMapping("/courses/{courseId}/grades")
    public ResponseEntity<GradebookResponse> getGrades(@PathVariable UUID courseId) {
        GradebookResponse gradebook = courseService.getGrades(courseId);
        return ResponseEntity.ok(gradebook);
    }

}
