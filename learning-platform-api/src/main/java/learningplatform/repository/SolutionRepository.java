package learningplatform.repository;

import learningplatform.entity.Solution;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.UUID;

@RepositoryRestResource
public interface SolutionRepository extends CrudRepository<Solution, UUID> {
}
