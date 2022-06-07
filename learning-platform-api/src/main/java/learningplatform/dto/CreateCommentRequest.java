package learningplatform.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.AllArgsConstructor;
import lombok.Value;

@Value
@AllArgsConstructor(onConstructor_ = {@JsonCreator})
public class CreateCommentRequest {

    String text;

}
