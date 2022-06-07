package learningplatform.dto;

import lombok.Value;

@Value
public class CreateCourseItemRequest {

    String itemType;
    String title;
    String content;

}
