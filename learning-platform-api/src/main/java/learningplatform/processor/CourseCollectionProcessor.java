package learningplatform.processor;

import learningplatform.entity.Course;
import learningplatform.util.SecurityUtils;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class CourseCollectionProcessor implements RepresentationModelProcessor<CollectionModel<EntityModel<Course>>> {

    @Override
    public CollectionModel<EntityModel<Course>> process(CollectionModel<EntityModel<Course>> model) {
        if (SecurityUtils.isTeacher()) {
            model.add(model.getRequiredLink(IanaLinkRelations.SELF).withRel(IanaLinkRelations.EDIT));
        }
        return model;
    }

}
