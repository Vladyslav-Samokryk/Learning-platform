package learningplatform.processor;

import learningplatform.entity.Assignment;
import learningplatform.entity.User;
import learningplatform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.support.SelfLinkProvider;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssignmentProcessor implements RepresentationModelProcessor<EntityModel<Assignment>> {

    private final SelfLinkProvider selfLinkProvider;

    @Override
    public EntityModel<Assignment> process(EntityModel<Assignment> model) {
        User currentUser = SecurityUtils.getCurrentUser();
        model.getContent().getSolutions().stream()
                .filter(solution -> solution.getStudent().equals(currentUser))
                .findAny()
                .map(instance -> selfLinkProvider.createSelfLinkFor(instance).withRel("my-solution"))
                .ifPresent(model::add);
        return model;
    }

}
