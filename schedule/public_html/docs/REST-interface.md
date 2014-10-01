type:
    http://staff.mmcs.sfedu.ru/~schedule/getdata.php?data=list&type=Teachers
    {
        "1": {
            "id": "133",
            "title": "Абанин Александр Васильевич"
        }
    }

    Proposed:
    http://backend.domain/teachers/list
    {
        "1": { // Нужен ли этот индекс?
            "id": "133",
            "fullName": "Абанин Александр Васильевич",
            "abbrName": "Абанин А.В.",
            "department": "204", // Это не номер аудитории, а id в списке кафедр. Имя дурацкое, хочется правильного. Да и нужно ли?
        }
    }

schedule:
    http://staff.mmcs.sfedu.ru/~schedule/getdata.php?data=schedule&type=Teacher&id=142
    {
        "schedule":
        {
            "4":
            {
                "4":
                {
                    "subject":"Спецкурс",
                    "subject_short":"С/к",
                    "id":"17",
                    "groups":{"1":"3.1"},
                    "groups_count":1,
                    "auditory":"101 (М)"
                }
            },
            "6":
            {
                "2":
                {
                    "subject":"Операционные системы",
                    "subject_short":"ОС",
                    "id":"9",
                    "groups":{"1":"2.1"},
                    "groups_count":1,
                    "auditory":"202"
                },
                "4":
                {
                    "subject":"Курс по выбору",
                    "subject_short":"Курс по выбору",
                    "id":"22",
                    "groups":{"1":"3.7"},
                    "groups_count":1,
                    "auditory":"312"
                }
            }
        }
    }
    proposed:
    http://backend.damain/schedule/byTeacher/142
    {
        {
            "timeslot":
            {
                "day": 4,
                "slot": 2,
                "week": "up"
            },
            "subject":"Спецкурс",
            "subject_short":"С/к",
            "id":"17",
            "groups":["3.1", "3.2"],
            "auditory":["101 (М)"]
        },
        {
            "timeslot":
            {
                "day": 2,
                "slot": 3
            },
            "subject":"Операционные системы",
            "subject_short":"ОС",
            "id":"9",
            "groups":["2.1"],
            "groups_count":1,
            "auditory":["202"]
        }
    }
