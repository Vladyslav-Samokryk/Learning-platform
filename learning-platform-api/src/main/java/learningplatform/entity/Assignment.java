package learningplatform.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("assignment")
@Getter
@Setter
public class Assignment extends CourseItem {

    @Column(name = "due_date")
    private LocalDate dueDate;

    @OneToMany(mappedBy = "assignment", orphanRemoval = true)
    @OrderBy("createdAt")
    private List<Solution> solutions = new ArrayList<>();

    public void addSolution(Solution solution) {
        solutions.add(solution);
        solution.setAssignment(this);
    }

}
