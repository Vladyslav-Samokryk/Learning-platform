package learningplatform;

import learningplatform.entity.Assignment;
import learningplatform.entity.Comment;
import learningplatform.entity.Course;
import learningplatform.entity.CourseItem;
import learningplatform.entity.Lecture;
import learningplatform.entity.User;
import learningplatform.entity.User.Role;
import learningplatform.repository.CourseRepository;
import learningplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MyDatabaseInitializer implements ApplicationRunner {

    private final UserRepository userRepository;

    private final CourseRepository courseRepository;

    @Override
    public void run(ApplicationArguments args) {
        User teacher = createTeacherAccount();

        final Instant oneHourAgo = Instant.now().minusSeconds(3600L);

        Course course01 = new Course();
        course01.setTitle("Machine Learning");
        course01.setDescription("Machine learning is the science of getting computers to act without being explicitly programmed. In the past decade, machine learning has given us self-driving cars, practical speech recognition, effective web search, and a vastly improved understanding of the human genome. Machine learning is so pervasive today that you probably use it dozens of times a day without knowing it. Many researchers also think it is the best way to make progress towards human-level AI. In this class, you will learn about the most effective machine learning techniques, and gain practice implementing them and getting them to work for yourself. More importantly, you'll learn about not only the theoretical underpinnings of learning, but also gain the practical know-how needed to quickly and powerfully apply these techniques to new problems. Finally, you'll learn about some of Silicon Valley's best practices in innovation as it pertains to machine learning and AI.");
        course01.setCreatedAt(oneHourAgo.plusSeconds(10L));

        Lecture lecture01 = new Lecture();
        lecture01.setTitle("Introduction");
        lecture01.setContent("" +
                "<h1 class=\"ql-align-center\">Quill Rich Text Editor</h1>\n" +
                "<p><br></p>\n" +
                "<p>Quill is a free, <a href=\"https://github.com/quilljs/quill/\" target=\"_blank\">open source</a> WYSIWYG editor built for the modern web. With its <a href=\"https://quilljs.com/docs/modules/\" target=\"_blank\">modular architecture</a> and expressive <a href=\"https://quilljs.com/docs/api/\" target=\"_blank\">API</a>, it is completely customizable to fit any need.</p>\n" +
                "<p><br></p>\n" +
                "<iframe class=\"ql-video ql-align-center\" frameborder=\"0\" allowfullscreen=\"true\" src=\"https://player.vimeo.com/video/253905163\" height=\"280\" width=\"500\"></iframe>\n" +
                "<p><br></p>\n" +
                "<h2 class=\"ql-align-center\">Getting Started is Easy</h2>\n" +
                "<p><br></p>\n" +
                "<pre spellcheck=\"false\">// &lt;link href=\"https://cdn.quilljs.com/1.2.6/quill.snow.css\" rel=\"stylesheet\"&gt;\n" +
                "// &lt;script src=\"https://cdn.quilljs.com/1.2.6/quill.min.js\"&gt;&lt;/script&gt;\n" +
                "\n" +
                "var quill = new Quill('#editor', {\n" +
                "  modules: {\n" +
                "    toolbar: '#toolbar'\n" +
                "  },\n" +
                "  theme: 'snow'\n" +
                "});\n" +
                "\n" +
                "// Open your browser's developer console to try out the API!\n" +
                "</pre>\n");
        lecture01.setCreatedAt(oneHourAgo.plusSeconds(11L));
        course01.addItem(lecture01);

        Lecture lecture02 = new Lecture();
        lecture02.setTitle("Linear Regression with One Variable");
        lecture02.setContent("<h1 class=\"ql-align-center\">TODO</h1>\n");
        lecture02.setCreatedAt(oneHourAgo.plusSeconds(12L));
        course01.addItem(lecture02);

        Assignment assignment03 = new Assignment();
        assignment03.setTitle("Assignment #1");
        assignment03.setContent("<h3 class=\"ql-align-center\">very hard task</h3>\n");
        assignment03.setCreatedAt(oneHourAgo.plusSeconds(13L));
        course01.addItem(assignment03);

        Lecture lecture04 = new Lecture();
        lecture04.setTitle("Linear Algebra Review");
        lecture04.setContent("<h1 class=\"ql-align-center\">TODO</h1>\n");
        lecture04.setCreatedAt(oneHourAgo.plusSeconds(14L));
        course01.addItem(lecture04);

        Lecture lecture05 = new Lecture();
        lecture05.setTitle("Linear Regression with Multiple Variables");
        lecture05.setContent("<h1 class=\"ql-align-center\">TODO</h1>\n");
        lecture05.setCreatedAt(oneHourAgo.plusSeconds(15L));
        course01.addItem(lecture05);

        Assignment assignment06 = new Assignment();
        assignment06.setTitle("Assignment #2");
        assignment06.setContent("<h3 class=\"ql-align-center\">very very hard task</h3>\n");
        assignment06.setCreatedAt(oneHourAgo.plusSeconds(16L));
        course01.addItem(assignment06);

        Lecture lecture07 = new Lecture();
        lecture07.setTitle("Octave/Matlab Tutorial");
        lecture07.setContent("<h1 class=\"ql-align-center\">TODO</h1>\n");
        lecture07.setCreatedAt(oneHourAgo.plusSeconds(17L));
        course01.addItem(lecture07);

        Lecture lecture08 = new Lecture();
        lecture08.setTitle("Logistic Regression");
        lecture08.setContent("<h1 class=\"ql-align-center\">TODO</h1>\n");
        lecture08.setCreatedAt(oneHourAgo.plusSeconds(18L));
        course01.addItem(lecture08);

        Assignment assignment09 = new Assignment();
        assignment09.setTitle("Assignment #3");
        assignment09.setContent("<h3 class=\"ql-align-center\">very very very hard task</h3>\n");
        assignment09.setCreatedAt(oneHourAgo.plusSeconds(19L));
        course01.addItem(assignment09);


        List<String> commentText = List.of("such cool", "much amaze", "wow", "very interest", "nice job");

        for (int i = 1; i < 10 + 1; i++) {
            User student = createStudentAccount(i);
            if (i <= 5) {
                course01.getStudents().add(student);

                CourseItem courseItem = course01.getItems().get((i - 1) % 2);
                Comment comment = new Comment();
                comment.setText(commentText.get(i - 1));
                comment.setCreatedAt(oneHourAgo.plusSeconds(i * 60L));
                comment.setUser(student);
                courseItem.addComment(comment);
            } else {
                course01.getRequests().add(student);
            }
        }

        course01.getItems().stream().limit(2).forEach(courseItem -> {
            Comment comment = new Comment();
            comment.setText("Thanks!");
            comment.setCreatedAt(oneHourAgo.plusSeconds(600L));
            comment.setUser(teacher);
            courseItem.addComment(comment);
        });


        Course course02 = new Course();
        course02.setTitle("The Science of Well-Being");
        course02.setDescription("In this course you will engage in a series of challenges designed to increase your own happiness and build more productive habits. As preparation for these tasks, Professor Laurie Santos reveals misconceptions about happiness, annoying features of the mind that lead us to think the way we do, and the research that can help us change. You will ultimately be prepared to successfully incorporate a specific wellness activity into your life.");
        course02.setCreatedAt(oneHourAgo.plusSeconds(20L));

        Course course03 = new Course();
        course03.setTitle("First Step Korean");
        course03.setDescription("This is an elementary-level Korean language course, consisting of 5 lessons with 4 units, and covers 4 skills: reading, writing, listening and speaking. The main topics include basic expressions used in everyday life, such as greetings, introducing yourself, talking about your family and a daily life and so on. Each lesson covers dialogues, pronunciation, vocabulary, grammar, quizzes and role-plays.");
        course03.setCreatedAt(oneHourAgo.plusSeconds(30L));

        Course course04 = new Course();
        course04.setTitle("Programming for Everybody");
        course04.setDescription("This course aims to teach everyone the basics of programming computers using Python. We cover the basics of how one constructs a program from a series of simple instructions in Python. The course has no pre-requisites and avoids all but the simplest mathematics. Anyone with moderate computer experience should be able to master the materials in this course. This course will cover Chapters 1-5 of the textbook “Python for Everybody”. Once a student completes this course, they will be ready to take more advanced programming courses. This course covers Python 3.");
        course04.setCreatedAt(oneHourAgo.plusSeconds(40L));

        Course course05 = new Course();
        course05.setTitle("Foundations of Project Management");
        course05.setDescription("This course is the first in a series of six to equip you with the skills you need to apply to introductory-level roles in project management. Project managers play a key role in leading, planning and implementing critical projects to help their organizations succeed. In this course, you’ll discover foundational project management terminology and gain a deeper understanding of the role and responsibilities of a project manager. We’ll also introduce you to the kinds of jobs you might pursue after completing this program. Throughout the program, you’ll learn from current Google project managers, who can provide you with a multi-dimensional educational experience that will help you build your skills for on-the-job application.");
        course05.setCreatedAt(oneHourAgo.plusSeconds(50L));


        courseRepository.saveAll(Arrays.asList(course01, course02, course03, course04, course05));
    }

    private User createTeacherAccount() {
        User teacher = new User();
        teacher.setFullName("Teacher Teacher");
        teacher.setUsername("teacher");
        teacher.setPassword("{noop}teacher");
        teacher.setEmail(teacher.getUsername() + "@example.com");
        teacher.setRole(Role.TEACHER);
        return userRepository.save(teacher);
    }

    private User createStudentAccount(int x) {
        User student = new User();
        student.setFullName(String.format("Student%1$02d Student%1$02d", x));
        student.setUsername(String.format("student%1$02d", x));
        student.setPassword(String.format("{noop}student%1$02d", x));
        student.setEmail(student.getUsername() + "@example.com");
        student.setRole(Role.STUDENT);
        return userRepository.save(student);
    }

}
