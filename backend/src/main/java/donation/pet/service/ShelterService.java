package donation.pet.service;

import donation.pet.domain.adopt.Adopt;
import donation.pet.domain.adopt.AdoptRepository;
import donation.pet.domain.member.consumer.ConsumerRepository;
import donation.pet.domain.member.shelter.Shelter;
import donation.pet.domain.member.shelter.ShelterRepository;
import donation.pet.domain.pet.AdoptStatus;
import donation.pet.domain.pet.Pet;
import donation.pet.domain.pet.PetRepository;
import donation.pet.dto.adopt.*;
import donation.pet.dto.pet.PetSimpleDto;
import donation.pet.dto.shelter.*;
import donation.pet.exception.BaseException;
import donation.pet.exception.ErrorCode;
import donation.pet.util.MailUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static donation.pet.service.S3Service.CLOUD_FRONT_DOMAIN_NAME;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShelterService {

    private final ShelterRepository shelterRepository;
    private final AdoptRepository adoptRepository;
    private final ConsumerRepository consumerRepository;
    private final PetRepository petRepository;
    private final ModelMapper modelMapper;
    private final S3Service s3Service;
    private final PasswordEncoder passwordEncoder;

    public ShelterListResponseDto getAllShelters() {
        List<ShelterResponseDto> shelterResponseDtos = shelterRepository.findAll().stream()
                .map(shelter -> modelMapper.map(shelter, ShelterResponseDto.class))
                .collect(Collectors.toList());
        return new ShelterListResponseDto(shelterResponseDtos);
    }

    public ShelterResponseDto getShelter(Long shelterId) {
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new BaseException(ErrorCode.SHELTER_NOT_EXIST));
        int[] monthlyAdoption = shelter.getMonthlyAdoptionFromYear(LocalDate.now().getYear());
        ShelterResponseDto dto = modelMapper.map(shelter, ShelterResponseDto.class);
        dto.setMonthlyAdoption(monthlyAdoption);
        return dto;
    }

    @Transactional
    public ShelterResponseDto updateShelter(Long shelterId, ShelterUpdateRequestDto dto) {
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new BaseException(ErrorCode.SHELTER_NOT_EXIST));

        // ?????? ???????????? ????????? dto ??? ????????? ????????? ?????? ?????????. ????????? ?????? ???????????? ????????? ???????????? ????????????
        if (!shelter.getName().equals(dto.getName()) && checkShelterName(dto.getName())) {
            throw new BaseException(ErrorCode.NAME_DUPLICATION);
        }

        // [???????????? ????????? ????????? ??????]
        // ??? ??????????????? ????????? ???????????? ????????? ????????????.
        if (dto.getNewPassword() == null) {
            shelter.updateShelter(dto, shelter.getPassword());
        } else if(!passwordEncoder.matches(dto.getCurrentPassword(), shelter.getPassword())) {
            // ??? ??????????????? ????????? ?????? ???????????? ????????? ??????
            throw new BaseException(ErrorCode.PASSWORD_NOT_CORRECT);
        } else {
            // ???????????? ?????? ??????
            shelter.updateShelter(dto, passwordEncoder.encode(dto.getNewPassword()));
        }

        return modelMapper.map(shelter, ShelterResponseDto.class);
    }

    public boolean checkShelterName(String name) {
        return shelterRepository.existsByName(name);
    }

    @Transactional
    public void saveShelterImage(Long shelterId, MultipartFile file) throws IOException {
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new BaseException(ErrorCode.SHELTER_NOT_EXIST));
        shelter.updateProfileImage("https://" + CLOUD_FRONT_DOMAIN_NAME + "/" + s3Service.uploadFile(file));
        shelterRepository.save(shelter);
    }

    // ?????? ???????????? ????????? ?????? ?????? ????????? ??????
    public AdoptListResponseDto getAdoptsByShelter(Long shelterId) {

        List<Adopt> adopts = adoptRepository.findByShelter(shelterId);
        List<AdoptSimpleDto> result = adopts.stream()
                .map(adopt -> modelMapper.map(adopt, AdoptSimpleDto.class))
                .collect(Collectors.toList());
        return new AdoptListResponseDto(result);

    }

    // ?????? ?????? ????????? ?????? ??????
    public AdoptResponseDto getAdopt(Long shelterId, Long adoptId) {
        Adopt adopt = adoptRepository.findById(adoptId)
                .orElseThrow(() -> new BaseException(ErrorCode.ADOPT_NOT_EXIST));
        if (!adopt.getShelter().getId().equals(shelterId)) {
            throw new BaseException(ErrorCode.SHELTER_NOT_MATCH);
        }
        return adopt.toAdoptDto();
    }

    // ?????? ?????? ?????? ?????? ??????
    @Transactional
    public AdoptResponseDto updateAdopt(Long shelterId, Long adoptId, AdoptStatusDto dto) {
        Adopt adopt = adoptRepository.findById(adoptId).orElseThrow(() -> new BaseException(ErrorCode.ADOPT_NOT_EXIST));
        adopt.changeAccept(dto.getStatus());
        adoptRepository.save(adopt);
        return adopt.toAdoptDto();
    }


    // ?????? ????????? ?????? ?????????
    public List<PetSimpleDto> getPetsByShelterId(Long shelterId){
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new BaseException(ErrorCode.SHELTER_NOT_EXIST));
        return shelter.getPets().stream()
                .filter(pet -> pet.getAdoptStatus() != AdoptStatus.DELETE)
                .map(Pet::changeToDto)
                .map(pet -> modelMapper.map(pet, PetSimpleDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public ShelterMainResponseDto updateShelterMain(Long shelterId, ShelterMainRequestDto dto) {
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new BaseException(ErrorCode.SHELTER_NOT_EXIST));
        shelter.updateMainShelter(dto);
        shelterRepository.save(shelter);
        return modelMapper.map(shelter, ShelterMainResponseDto.class);
    }

    public ShelterMainResponseDto getShelterMain(Long shelterId) {
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new BaseException(ErrorCode.SHELTER_NOT_EXIST));
        return modelMapper.map(shelter, ShelterMainResponseDto.class);
    }
}
