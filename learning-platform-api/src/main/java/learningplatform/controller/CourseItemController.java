package learningplatform.controller;

import learningplatform.dto.CreateCommentRequest;
import learningplatform.entity.Solution;
import learningplatform.service.CourseItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.support.SelfLinkProvider;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.EntityLinks;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RepositoryRestController
@RequiredArgsConstructor
public class CourseItemController {

    private final CourseItemService courseItemService;

    private final SelfLinkProvider selfLinkProvider;

    private final EntityLinks entityLinks;

    @PostMapping("/items/{itemId}/comments")
    public ResponseEntity<?> postComments(@PathVariable UUID itemId,
            @RequestBody CreateCommentRequest createCommentRequest) {
        courseItemService.createComment(itemId, createCommentRequest);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/items/{itemId}/solutions")
    public ResponseEntity<?> postSolutions(@PathVariable UUID itemId,
            @RequestParam("file") MultipartFile file) {
        Solution solution = courseItemService.createSolution(itemId, file);
        URI selfLink = selfLinkProvider.createSelfLinkFor(solution).toUri();
        return ResponseEntity.created(selfLink).build();
    }

    @GetMapping("/items/{itemId}/solutions")
    public ResponseEntity<?> getSolutions(@PathVariable UUID itemId) {
        List<EntityModel<Solution>> solutionModels =
                courseItemService.findAssignmentById(itemId).getSolutions().stream()
                        .map(solution -> EntityModel.of(solution,
                                selfLinkProvider.createSelfLinkFor(solution).withRel(IanaLinkRelations.SELF),
                                selfLinkProvider.createSelfLinkFor(solution.getStudent()).withRel("student")))
                        .collect(Collectors.toList());
        return ResponseEntity.ok(CollectionModel.of(solutionModels,
                Link.of("http://localhost:8080/items/" + itemId + "/solutions", IanaLinkRelations.SELF)));
    }

}
