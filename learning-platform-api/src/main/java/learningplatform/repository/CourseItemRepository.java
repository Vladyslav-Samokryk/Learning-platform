package learningplatform.repository;

import learningplatform.entity.CourseItem;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.UUID;

@RepositoryRestResource
public interface CourseItemRepository extends CrudRepository<CourseItem, UUID> {
}
