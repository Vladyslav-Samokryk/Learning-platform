package learningplatform.processor;

import learningplatform.entity.User;
import learningplatform.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.support.SelfLinkProvider;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserCollectionProcessor implements RepresentationModelProcessor<CollectionModel<EntityModel<User>>> {

    private final SelfLinkProvider selfLinkProvider;

    @Override
    public CollectionModel<EntityModel<User>> process(CollectionModel<EntityModel<User>> model) {
        User currentUser = SecurityUtils.getCurrentUser();
        model.add(selfLinkProvider.createSelfLinkFor(currentUser).withRel("currentUser"));
        return model;
    }

}
