package learningplatform.controller;

import learningplatform.entity.Solution;
import learningplatform.repository.SolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SolutionController {

    private final SolutionRepository solutionRepository;

    @GetMapping("/solutions/{solutionId}/download")
    public ResponseEntity<Resource> getDownload(@PathVariable UUID solutionId) {
        return solutionRepository.findById(solutionId)
                .map(solution -> ResponseEntity.ok()
                        .headers(headers -> headers.setContentDisposition(
                                ContentDisposition.attachment()
                                        .filename(solution.getOriginalFilename())
                                        .build()))
                        .body(download(solution)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Resource download(Solution solution) {
        return new FileSystemResource(Path.of("files", solution.getId().toString()));
    }

}
