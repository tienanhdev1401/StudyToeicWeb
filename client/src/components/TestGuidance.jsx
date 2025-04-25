import React, { useEffect, useState, useRef } from 'react';
import '../styles/DoTest.css';

const TestGuidance = ({ part, onClose }) => {
    const [audioError, setAudioError] = useState(false);
    const [audioLoaded, setAudioLoaded] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef(null);
    const timerRef = useRef(null);
    const hasAttemptedPlay = useRef(false); // Track if we've already tried to play

    // Content for each part's guidance
    const guidanceContent = {
        1: {
            title: "Hướng dẫn Part 1: Mô tả hình ảnh",
            description: "",
            customHTML: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px',  marginLeft: '2vw' }}>
                    <img
                        src="/assets/img/guidance/part1_guidance.jpg"
                        alt="Hình minh họa Part 1"
                      
                    />
                </div>
            ),
            audioSrc: "/assets/audio/guidance/part1_guidance.mp3"
        },

        2: {
            title: "Hướng dẫn Part 2: Hỏi - Đáp",
            description: "",
            imageSrc: "/assets/img/guidance/part2_guidance.jpg",
            audioSrc: "/assets/audio/guidance/part2_guidance.mp3"
        },
        3: {
            title: "Hướng dẫn Part 3: Đoạn hội thoại",
            description: "",
            imageSrc: "/assets/img/guidance/part3_guidance.jpg",
            audioSrc: "/assets/audio/guidance/part3_guidance.mp3"
        },
        4: {
            title: "Hướng dẫn Part 4: Bài nói ngắn",
            description: "",
            imageSrc: "/assets/img/guidance/part4_guidance.jpg",
            audioSrc: "/assets/audio/guidance/part4_guidance.mp3"
        },
        5: {
            title: "Hướng dẫn Part 5: Hoàn thành câu",
            description: "",
            imageSrc: "/assets/img/guidance/part5_guidance.png"
        },
        6: {
            title: "Hướng dẫn Part 6: Hoàn thành đoạn văn",
            description: "",
            imageSrc: "/assets/img/guidance/part6_guidance.jpg"
        },
        7: {
            title: "Hướng dẫn Part 7: Đọc hiểu",
            description: "",
            imageSrc: "/assets/img/guidance/part7_guidance.jpg"
        }
    };

    const content = guidanceContent[part];

    // Handle when audio can play
    const handleCanPlay = () => {
        setAudioLoaded(true);

        // Only try to play once when it's ready
        if (!hasAttemptedPlay.current && audioRef.current) {
            hasAttemptedPlay.current = true;
            try {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsAudioPlaying(true);
                        })
                        .catch(err => {
                            console.error("Auto-play prevented:", err);
                            setAudioError(true);
                        });
                }
            } catch (error) {
                console.error("Error playing audio:", error);
                setAudioError(true);
            }
        }
    };

    // Handle audio errors
    const handleAudioError = (e) => {
        console.log("Audio file not found or cannot be played");
        setAudioError(true);
        setIsAudioPlaying(false);

        // If audio fails, automatically close after some time
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            onClose();
        }, 6000);
    };

    // Handle audio ending
    const handleAudioEnd = () => {
        setIsAudioPlaying(false);

        // Auto-close guidance when audio ends
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            onClose();
        }, 2000); // Give a short delay after audio ends before closing
    };

    // Auto-play audio and handle audio completion - fixed to prevent infinite loops
    useEffect(() => {
        // Clean up function for any resources
        const cleanup = () => {
            // Clear any existing timers
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            // Clean up audio element
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
                audioRef.current.removeEventListener('error', handleAudioError);
                audioRef.current.removeEventListener('ended', handleAudioEnd);
                audioRef.current = null;
            }
        };

        // Reset state on mount
        setAudioError(false);
        setAudioLoaded(false);
        setIsAudioPlaying(false);
        hasAttemptedPlay.current = false;

        // Run cleanup to ensure we don't have lingering resources
        cleanup();

        // Only for parts 1-4 which have audio
        if (content && content.audioSrc && part <= 4) {
            // Create a new Audio element to play automatically
            const audio = new Audio(content.audioSrc);
            audioRef.current = audio;

            // Add event listeners
            audio.addEventListener('canplaythrough', handleCanPlay);
            audio.addEventListener('error', handleAudioError);
            audio.addEventListener('ended', handleAudioEnd);

            // Load the audio
            audio.load();
        } else {
            // For parts without audio, set a timeout to auto-continue
            timerRef.current = setTimeout(() => {
                onClose();
            }, 8000); // Give users time to read guidance for reading parts
        }

        // Cleanup function
        return cleanup;
        // Important: Only run this effect on mount and when part changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [part]);

    if (!content) {
        return null;
    }

    return (
        <div className="guidance-overlay">
            <div className="guidance-container">
                <h2 className="guidance-title">{content.title}</h2>
                <div className="guidance-content">
                    {content.customHTML ? (
                        content.customHTML
                    ) : (
                        <>
                            <div className="guidance-image">
                                <img
                                    src={content.imageSrc}
                                    alt={`Hướng dẫn Part ${part}`}
                                    onError={(e) => {
                                        e.target.src = "/assets/img/guidance/placeholder-image.jpg";
                                        e.target.alt = "Hình ảnh hướng dẫn không khả dụng";
                                    }}
                                />
                            </div>
                            <p className="guidance-description">{content.description}</p>
                        </>
                    )}
                <p className="guidance-description">{content.description}</p>

                {/* Audio status message instead of visible player for parts 1-4 */}
                {content.audioSrc && part <= 4 && (
                    <div className="audio-status-container">
                        {audioError ? (
                            <div className="audio-error">
                                <p>Không thể phát audio hướng dẫn. Vui lòng đọc hướng dẫn ở trên.</p>
                            </div>
                        ) : isAudioPlaying ? (
                            <div className="audio-status playing">
                            </div>
                        ) : audioLoaded ? (
                            <div className="audio-status">
                                <p>Audio hướng dẫn đã kết thúc.</p>
                            </div>
                        ) : (
                            <div className="audio-status">
                                <p>Đang tải audio hướng dẫn...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="guidance-actions">
                <button className="guidance-continue-btn" onClick={onClose}>
                    Tiếp tục làm bài
                </button>
            </div>
        </div>
    </div >
  );
};

export default TestGuidance; 