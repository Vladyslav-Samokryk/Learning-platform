package learningplatform.processor;

import learningplatform.entity.Solution;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class SolutionProcessor implements RepresentationModelProcessor<EntityModel<Solution>> {

    @Override
    public EntityModel<Solution> process(EntityModel<Solution> model) {
        model.add(Link.of(model.getRequiredLink(IanaLinkRelations.SELF).getHref() + "/download", "download"));
        return model;
    }

}
