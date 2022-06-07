package learningplatform.processor;

import learningplatform.entity.Course;
import learningplatform.util.SecurityUtils;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class CourseProcessor implements RepresentationModelProcessor<EntityModel<Course>> {

    @Override
    public EntityModel<Course> process(EntityModel<Course> model) {
        if (SecurityUtils.isTeacher()) {
            model.add(model.getRequiredLink(IanaLinkRelations.SELF).withRel(IanaLinkRelations.EDIT));
        } else if (model.getContent().getStudents().contains(SecurityUtils.getCurrentUser())) {
            model.add(model.getRequiredLink(IanaLinkRelations.SELF).withRel("view"));
        }
        return model;
    }

}
