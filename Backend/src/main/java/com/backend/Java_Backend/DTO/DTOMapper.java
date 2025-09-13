package com.backend.Java_Backend.DTO;

import com.backend.Java_Backend.DTO.MessageDTO;
import com.backend.Java_Backend.DTO.MessageThreadDTO;
import com.backend.Java_Backend.DTO.ThreadParticipantDTO;
import com.backend.Java_Backend.Models.Message;
import com.backend.Java_Backend.Models.MessageThread;
import com.backend.Java_Backend.Models.ThreadParticipant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DTOMapper {
    MessageDTO toMessageDTO(Message message);
    Message toMessageEntity(MessageDTO dto);
    MessageThreadDTO toMessageThreadDTO(MessageThread thread);
    MessageThread toMessageThreadEntity(MessageThreadDTO dto);
    ThreadParticipantDTO toThreadParticipantDTO(ThreadParticipant participant);
    ThreadParticipant toThreadParticipantEntity(ThreadParticipantDTO dto);
}
