package com.backend.Java_Backend.DTO;

import com.backend.Java_Backend.DTO.MessageDTO;
import com.backend.Java_Backend.DTO.MessageThreadDTO;
import com.backend.Java_Backend.DTO.ThreadParticipantDTO;
import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.ThreadParticipant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DTOMapper {
    MessageDTO toMessageDTO(Message message);
    Message toMessageEntity(MessageDTO dto);
    MessageThreadDTO toMessageThreadDTO(MessageThread thread);
    MessageThread toMessageThreadEntity(MessageThreadDTO dto);
    @Mapping(source = "id.threadId", target = "threadId")
    @Mapping(source = "id.studentId", target = "studentId")
    ThreadParticipantDTO toThreadParticipantDTO(ThreadParticipant participant);

    @Mapping(target = "id", expression = "java(new com.backend.Java_Backend.Models.ThreadParticipantId(dto.getThreadId(), dto.getStudentId()))")
    ThreadParticipant toThreadParticipantEntity(ThreadParticipantDTO dto);

}
