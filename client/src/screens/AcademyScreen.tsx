import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Image,
  Animated
} from 'react-native';
import { useTrading } from '../context/TradingContext';

interface Lesson {
  id: string;
  title: string;
  content: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  rewardCash: number;
  rewardXp: number;
}

interface Track {
  id: string;
  title: string;
  icon?: string;
  description: string;
  lessons: Lesson[];
}

interface AcademyScreenProps {
  onNavigateTrade?: () => void;
}

export const AcademyScreen: React.FC<AcademyScreenProps> = ({ onNavigateTrade }) => {
  const { activeMarket } = useTrading();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['lesson_1']);
  const [userXp, setUserXp] = useState<number>(340);

  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/academy');
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        setTracks(data.tracks);
      }
    } catch (e) {
      console.error('Failed to load academy tracks', e);
      // Fallback tracks
      setTracks([
        {
          id: 'track_basics',
          title: 'Stock Market 101',
          description: 'Essential fundamentals of trading, bid-ask spread & order mechanics',
          lessons: [
            {
              id: 'lesson_1',
              title: 'How Stock Prices Move',
              content: 'Stock prices are determined by supply and demand in the order book. When aggressive buyers enter market orders, they absorb available sell liquidity and drive prices upward.',
              quiz: {
                question: 'What causes a stock price to rise?',
                options: ['More buyers aggressively taking sell liquidity', 'The exchange arbitrarily sets higher rates', 'Companies printing new certificates', 'High interest rates only'],
                correctIndex: 0,
                explanation: 'Aggressive market buy orders consume ask liquidity, driving the transaction price higher.'
              },
              rewardCash: 5000,
              rewardXp: 100
            },
            {
              id: 'lesson_2',
              title: 'Market Orders vs Limit Orders',
              content: 'A Market Order fills immediately at best available current prices. A Limit Order executes only at your specified target price or better, ensuring strict price control.',
              quiz: {
                question: 'When should you prioritize a Limit Order?',
                options: ['When price execution certainty is more important than speed', 'When you must exit instantly in panic', 'When the market is closed only', 'Only on weekends'],
                correctIndex: 0,
                explanation: 'Limit orders guarantee your entry or exit price, shielding you from adverse market slippage.'
              },
              rewardCash: 7500,
              rewardXp: 120
            }
          ]
        },
        {
          id: 'track_candles',
          title: 'Candlestick Mastery',
          description: 'Recognize bullish pin bars, engulfing patterns and trend continuations',
          lessons: [
            {
              id: 'lesson_3',
              title: 'Bullish Hammer Pattern',
              content: 'The Hammer candle has a small upper body and a long lower wick (at least 2x the body). It shows sellers pushed price aggressively down, but buyers rejected lower levels with high volume.',
              quiz: {
                question: 'What does a long lower wick on a candle signify?',
                options: ['Strong rejection of lower prices by buyers', 'Heavy continuous selling into close', 'Market inactivity', 'Low volatility'],
                correctIndex: 0,
                explanation: 'A long lower shadow demonstrates that buyers seized control and rejected lower price levels.'
              },
              rewardCash: 10000,
              rewardXp: 150
            }
          ]
        },
        {
          id: 'track_fno',
          title: 'Indian F&O Options',
          description: 'Master Nifty & Sensex weekly options, strike selection & Greeks',
          lessons: [
            {
              id: 'lesson_4',
              title: 'Calls vs Puts Mechanics',
              content: 'Call Options (CE) confer the right to buy the underlying index, gaining value as market rises. Put Options (PE) confer the right to sell, gaining value during sharp market falls.',
              quiz: {
                question: 'If you expect BSE Sensex to rally sharply, which contract do you buy?',
                options: ['Call Option (CE)', 'Put Option (PE)', 'Short Call', 'Cash Bond'],
                correctIndex: 0,
                explanation: 'Buying a Call Option (CE) provides leveraged upside profit when the underlying index rallies.'
              },
              rewardCash: 15000,
              rewardXp: 200
            }
          ]
        }
      ]);
    }
  };

  const currentTrack = tracks[selectedTrackIndex] || tracks[0];

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !selectedLesson) return;
    setQuizSubmitted(true);

    const isCorrect = selectedAnswer === selectedLesson.quiz.correctIndex;
    if (isCorrect) {
      if (!completedLessonIds.includes(selectedLesson.id)) {
        setCompletedLessonIds(prev => [...prev, selectedLesson.id]);
        setUserXp(prev => prev + selectedLesson.rewardXp);
        const rewardText = isGlobal
          ? `+$50 Cash and +${selectedLesson.rewardXp} XP!`
          : `+₹${selectedLesson.rewardCash.toLocaleString()} Cash and +${selectedLesson.rewardXp} XP!`;
        if (Platform.OS === 'web') {
          // Native browser alert
          setTimeout(() => alert(`Lesson Passed! ${rewardText}`), 100);
        } else {
          Alert.alert('Lesson Complete!', rewardText);
        }
      }
    }
  };

  // If a lesson is actively open for reading/quiz
  if (selectedLesson) {
    const isCompleted = completedLessonIds.includes(selectedLesson.id);
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Back navigation */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedLesson(null)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: '/images/app-icons-png/School/ArrowLeft.png' }}
            style={styles.backIcon}
            resizeMode="contain"
          />
          <Text style={styles.backText}>Back to Curriculum</Text>
        </TouchableOpacity>

        {/* Lesson Hero Banner */}
        <View style={styles.lessonHeroCard}>
          <View style={styles.lessonTagRow}>
            <View style={styles.lessonCategoryPill}>
              <Text style={styles.lessonCategoryText}>{currentTrack?.title || 'Trading Lesson'}</Text>
            </View>
            {isCompleted && (
              <View style={styles.completedPill}>
                <Image
                  source={{ uri: '/images/app-icons-png/School/ChapterChecked.png' }}
                  style={styles.checkMini}
                />
                <Text style={styles.completedPillText}>Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.lessonHeroTitle}>{selectedLesson.title}</Text>
          <View style={styles.rewardRewardRow}>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardBadgeText}>
                Reward: {currencySymbol}{isGlobal ? '50' : selectedLesson.rewardCash.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.rewardBadge, styles.xpBadge]}>
              <Text style={styles.xpBadgeText}>+{selectedLesson.rewardXp} XP</Text>
            </View>
          </View>
        </View>

        {/* Content Box */}
        <View style={styles.contentBox}>
          <Text style={styles.contentHeader}>Overview & Strategy</Text>
          <Text style={styles.contentText}>{selectedLesson.content}</Text>
        </View>

        {/* Interactive Quiz Card */}
        <View style={styles.quizCard}>
          <View style={styles.quizHeaderRow}>
            <Image
              source={{ uri: '/images/app-icons-png/School/Reward.png' }}
              style={styles.quizIcon}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.quizTitle}>Knowledge Check</Text>
              <Text style={styles.quizSubtitle}>Answer correctly to claim your reward</Text>
            </View>
          </View>

          <Text style={styles.quizQuestion}>{selectedLesson.quiz.question}</Text>

          {/* Options */}
          <View style={styles.optionsCol}>
            {selectedLesson.quiz.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              let btnStyle: any = styles.optionBtn;
              let txtStyle: any = styles.optionText;

              if (quizSubmitted) {
                if (idx === selectedLesson.quiz.correctIndex) {
                  btnStyle = [styles.optionBtn, styles.optionCorrect];
                  txtStyle = [styles.optionText, styles.optionTextCorrect];
                } else if (isSelected) {
                  btnStyle = [styles.optionBtn, styles.optionWrong];
                  txtStyle = [styles.optionText, styles.optionTextWrong];
                }
              } else if (isSelected) {
                btnStyle = [styles.optionBtn, styles.optionSelected];
                txtStyle = [styles.optionText, styles.optionTextSelected];
              }

              return (
                <TouchableOpacity
                  key={idx}
                  style={btnStyle}
                  onPress={() => !quizSubmitted && setSelectedAnswer(idx)}
                  disabled={quizSubmitted}
                  activeOpacity={0.8}
                >
                  <View style={styles.optLetterBox}>
                    <Text style={styles.optLetter}>{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text style={txtStyle}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quiz Action / Feedback */}
          {!quizSubmitted ? (
            <TouchableOpacity
              style={[styles.submitQuizBtn, selectedAnswer === null && styles.submitQuizBtnDisabled]}
              onPress={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              activeOpacity={0.8}
            >
              <Text style={styles.submitQuizBtnText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.feedbackContainer}>
              <Text
                style={[
                  styles.feedbackVerdict,
                  selectedAnswer === selectedLesson.quiz.correctIndex
                    ? styles.verdictCorrect
                    : styles.verdictWrong
                ]}
              >
                {selectedAnswer === selectedLesson.quiz.correctIndex
                  ? 'Excellent! Correct Answer'
                  : 'Incorrect! Review and Try Again'}
              </Text>
              <Text style={styles.feedbackExplanation}>
                {selectedLesson.quiz.explanation}
              </Text>

              {selectedAnswer !== selectedLesson.quiz.correctIndex && (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    setQuizSubmitted(false);
                    setSelectedAnswer(null);
                  }}
                >
                  <Text style={styles.retryBtnText}>Retry Question</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Curriculum Main View
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Academy Top Header */}
        <View style={styles.screenHeader}>
          <View>
            <Text style={styles.screenTitle}>Bull Academy</Text>
            <Text style={styles.screenSubtitle}>Zero-Risk Market Training & Mastery</Text>
          </View>
          <View style={styles.xpCard}>
            <Image
              source={{ uri: '/images/app-icons-png/School/SchoolProgressIcon.png' }}
              style={styles.xpIcon}
              resizeMode="contain"
            />
            <Text style={styles.xpValue}>{userXp} XP</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.levelProgressCard}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>Rank: Level 2 Apprentice</Text>
            <Text style={styles.levelPercent}>
              {completedLessonIds.length} / {tracks.reduce((acc, t) => acc + (t.lessons?.length || 0), 0) || 5} Lessons Done
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(
                    100,
                    Math.round(
                      (completedLessonIds.length /
                        (tracks.reduce((acc, t) => acc + (t.lessons?.length || 0), 0) || 4)) *
                        100
                    )
                  )}%`
                }
              ]}
            />
          </View>
        </View>

        {/* Tracks Selector Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tracksScroll}
          contentContainerStyle={styles.tracksContent}
        >
          {tracks.map((tr, index) => {
            const isSelected = selectedTrackIndex === index;
            return (
              <TouchableOpacity
                key={tr.id || index}
                style={[styles.trackTab, isSelected && styles.trackTabActive]}
                onPress={() => setSelectedTrackIndex(index)}
                activeOpacity={0.8}
              >
                <Text style={[styles.trackTabText, isSelected && styles.trackTabTextActive]}>
                  {tr.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Track 3D Golden Bull Banner (Concept 3 Parity) */}
        {currentTrack && (
          <View style={styles.trackOverviewBannerGolden}>
            <View style={styles.trackOverviewCol}>
              <View style={styles.trackCurriculumBadge}>
                <Text style={styles.trackCurriculumBadgeText}>✦ MASTER CURRICULUM</Text>
              </View>
              <Text style={styles.trackOverviewTitleGolden}>{currentTrack.title}</Text>
              <Text style={styles.trackOverviewDescGolden}>{currentTrack.description}</Text>
            </View>
            <View style={styles.trackBannerImgWrap}>
              <Image
                source={{ uri: '/images/app-icons-png/School/SchoolHero.png' }}
                style={styles.trackBannerImg}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Duolingo-Style Milestone Journey Lessons */}
        <View style={styles.lessonsList}>
          <View style={styles.curriculumHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Curriculum Lessons</Text>
            <Text style={styles.curriculumStepCount}>
              {completedLessonIds.filter(id => currentTrack?.lessons?.some(l => l.id === id)).length} of {currentTrack?.lessons?.length || 0} Complete
            </Text>
          </View>

          {currentTrack?.lessons?.map((lesson, idx) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isPriorCompleted = idx === 0 || completedLessonIds.includes(currentTrack.lessons[idx - 1]?.id);
            const isActive = !isCompleted && isPriorCompleted;
            const isLocked = !isCompleted && !isPriorCompleted;

            return (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonRowCard,
                  isCompleted && styles.lessonRowCardCompleted,
                  isActive && styles.lessonRowCardActive
                ]}
                onPress={() => handleSelectLesson(lesson)}
                activeOpacity={0.8}
              >
                {/* Milestone Node */}
                <View
                  style={[
                    styles.milestoneNode,
                    isCompleted && styles.milestoneNodeCompleted,
                    isActive && styles.milestoneNodeActive,
                    isLocked && styles.milestoneNodeLocked
                  ]}
                >
                  <Text
                    style={[
                      styles.milestoneNodeText,
                      (isCompleted || isActive) && styles.milestoneNodeTextWhite
                    ]}
                  >
                    {isCompleted ? '✓' : isActive ? '▶' : `0${idx + 1}`}
                  </Text>
                </View>

                <View style={styles.lessonInfoCol}>
                  <Text style={[styles.lessonItemTitle, isActive && styles.lessonItemTitleActive]}>
                    {lesson.title}
                  </Text>
                  <View style={styles.rewardMiniRow}>
                    <Text style={styles.rewardMiniText}>
                      +{currencySymbol}{isGlobal ? '50' : lesson.rewardCash.toLocaleString()}
                    </Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.rewardMiniXp}>+{lesson.rewardXp} XP</Text>
                  </View>
                </View>

                <View style={styles.lessonStatusRight}>
                  {isCompleted ? (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>Completed ✓</Text>
                    </View>
                  ) : isActive ? (
                    <View style={styles.startBadgeActive}>
                      <Text style={styles.startBadgeTextActive}>Start →</Text>
                    </View>
                  ) : (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedBadgeText}>Up Next</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1D32',
    letterSpacing: -0.3
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    gap: 6
  },
  xpIcon: {
    width: 18,
    height: 18
  },
  xpValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#837CD2'
  },
  levelProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1D32'
  },
  levelPercent: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#EEF0F8',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#837CD2',
    borderRadius: 4
  },
  tracksScroll: {
    marginBottom: 14
  },
  tracksContent: {
    gap: 8
  },
  trackTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  trackTabActive: {
    backgroundColor: '#837CD2',
    borderColor: '#837CD2'
  },
  trackTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563'
  },
  trackTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  trackOverviewBanner: {
    flexDirection: 'row',
    backgroundColor: '#F3F2FD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E0FB',
    alignItems: 'center'
  },
  trackOverviewBannerGolden: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3
  },
  trackCurriculumBadge: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FCD34D'
  },
  trackCurriculumBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5
  },
  trackOverviewTitleGolden: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#78350F',
    marginBottom: 4
  },
  trackOverviewDescGolden: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17
  },
  trackBannerImgWrap: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trackOverviewCol: {
    flex: 1,
    paddingRight: 10
  },
  trackOverviewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 4
  },
  trackOverviewDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18
  },
  trackBannerImg: {
    width: 64,
    height: 64
  },
  curriculumHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  curriculumStepCount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#837CD2'
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 0
  },
  lessonsList: {
    gap: 10
  },
  lessonRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  lessonRowCardCompleted: {
    backgroundColor: '#FAFCFB',
    borderColor: '#E2F3EB'
  },
  lessonRowCardActive: {
    borderColor: '#837CD2',
    borderWidth: 1.5,
    shadowColor: '#837CD2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3
  },
  lessonItemTitleActive: {
    color: '#1E1D32',
    fontWeight: '800'
  },
  milestoneNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  milestoneNodeCompleted: {
    backgroundColor: '#01CEA5',
    borderColor: '#01CEA5'
  },
  milestoneNodeActive: {
    backgroundColor: '#837CD2',
    borderColor: '#837CD2',
    shadowColor: '#837CD2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3
  },
  milestoneNodeLocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB'
  },
  milestoneNodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280'
  },
  milestoneNodeTextWhite: {
    color: '#FFFFFF'
  },
  completedBadge: {
    backgroundColor: 'rgba(1, 206, 165, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(1, 206, 165, 0.3)'
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#01CEA5'
  },
  startBadgeActive: {
    backgroundColor: '#837CD2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#837CD2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2
  },
  startBadgeTextActive: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  lockedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8
  },
  lockedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9CA3AF'
  },
  lessonsList: {
    gap: 10
  },
  lessonRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  lessonRowCardCompleted: {
    backgroundColor: '#FAFCFB',
    borderColor: '#E2F3EB'
  },
  lessonOrderBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F2F3F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  lessonOrderNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280'
  },
  lessonInfoCol: {
    flex: 1
  },
  lessonItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1D32',
    marginBottom: 4
  },
  rewardMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rewardMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#01CEA5'
  },
  dotSeparator: {
    color: '#9CA3AF',
    fontSize: 10
  },
  rewardMiniXp: {
    fontSize: 12,
    fontWeight: '700',
    color: '#837CD2'
  },
  lessonStatusRight: {
    marginLeft: 8
  },
  statusCheckIcon: {
    width: 24,
    height: 24
  },
  startBadge: {
    backgroundColor: '#F3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  startBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#837CD2'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8
  },
  backIcon: {
    width: 16,
    height: 16
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#837CD2'
  },
  lessonHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAECF2',
    marginBottom: 14
  },
  lessonTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  lessonCategoryPill: {
    backgroundColor: '#F3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  lessonCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#837CD2'
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  checkMini: {
    width: 14,
    height: 14
  },
  completedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#01CEA5'
  },
  lessonHeroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 12
  },
  rewardRewardRow: {
    flexDirection: 'row',
    gap: 8
  },
  rewardBadge: {
    backgroundColor: '#EDFAF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  rewardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#01CEA5'
  },
  xpBadge: {
    backgroundColor: '#F3F2FD'
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#837CD2'
  },
  contentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAECF2',
    marginBottom: 14
  },
  contentHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1D32',
    marginBottom: 8
  },
  contentText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 22
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAECF2'
  },
  quizHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  quizIcon: {
    width: 28,
    height: 28
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1D32'
  },
  quizSubtitle: {
    fontSize: 11,
    color: '#6B7280'
  },
  quizQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1D32',
    marginBottom: 14,
    lineHeight: 20
  },
  optionsCol: {
    gap: 10,
    marginBottom: 16
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10
  },
  optionSelected: {
    borderColor: '#837CD2',
    backgroundColor: '#F8F7FF'
  },
  optionCorrect: {
    borderColor: '#01CEA5',
    backgroundColor: '#EDFAF5'
  },
  optionWrong: {
    borderColor: '#FF4D6A',
    backgroundColor: '#FFF1F3'
  },
  optLetterBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  optLetter: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280'
  },
  optionText: {
    fontSize: 13,
    color: '#374151',
    flex: 1
  },
  optionTextSelected: {
    color: '#837CD2',
    fontWeight: '700'
  },
  optionTextCorrect: {
    color: '#01CEA5',
    fontWeight: '700'
  },
  optionTextWrong: {
    color: '#FF4D6A',
    fontWeight: '700'
  },
  submitQuizBtn: {
    backgroundColor: '#837CD2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitQuizBtnDisabled: {
    opacity: 0.5
  },
  submitQuizBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  feedbackContainer: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  feedbackVerdict: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  verdictCorrect: {
    color: '#01CEA5'
  },
  verdictWrong: {
    color: '#FF4D6A'
  },
  feedbackExplanation: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10
  },
  retryBtn: {
    backgroundColor: '#1E1D32',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
