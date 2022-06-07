package learningplatform.repository;

import learningplatform.entity.Course;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.UUID;

@RepositoryRestResource
public interface CourseRepository extends CrudRepository<Course, UUID> {
}
