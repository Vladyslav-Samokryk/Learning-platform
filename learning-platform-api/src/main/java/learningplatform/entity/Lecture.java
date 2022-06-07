package learningplatform.entity;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("lecture")
public class Lecture extends CourseItem {
}
