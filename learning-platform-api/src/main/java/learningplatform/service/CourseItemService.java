package learningplatform.service;

import learningplatform.dto.CreateCommentRequest;
import learningplatform.entity.Assignment;
import learningplatform.entity.Comment;
import learningplatform.entity.CourseItem;
import learningplatform.entity.Solution;
import learningplatform.repository.CourseItemRepository;
import learningplatform.repository.SolutionRepository;
import learningplatform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseItemService {

    private final CourseItemRepository courseItemRepository;

    private final SolutionRepository solutionRepository;

    public void createComment(UUID itemId, CreateCommentRequest createCommentRequest) {
        CourseItem item = courseItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Comment comment = new Comment();
        comment.setText(createCommentRequest.getText());
        comment.setCreatedAt(Instant.now());
        comment.setUser(SecurityUtils.getCurrentUser());
        item.addComment(comment);
        courseItemRepository.save(item);
    }

    public Solution createSolution(UUID itemId, MultipartFile file) {
        Assignment assignment = findAssignmentById(itemId);
        Solution solution = new Solution();
        solution.setOriginalFilename(file.getOriginalFilename());
        solution.setCreatedAt(Instant.now());
        solution.setStudent(SecurityUtils.getCurrentUser());
        assignment.addSolution(solution);
        solution = solutionRepository.save(solution);
        saveFile(file, solution.getId().toString());
        return solution;
    }

    private void saveFile(MultipartFile file, String filename) {
        try {
            file.transferTo(Path.of("files", filename));
        } catch (IOException e) {
            log.warn("Error saving solution file", e);
        }
    }

    public Assignment findAssignmentById(UUID id) {
        return courseItemRepository.findById(id)
                .map(item -> {
                    if (!(item instanceof Assignment)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
                    }
                    return (Assignment) item;
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

}
