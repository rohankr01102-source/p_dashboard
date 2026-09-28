import { UserRepository } from "../repositories/UserRepository";
import { RecordingRepository } from "../repositories/RecordingRepository";
import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { GoalRepository } from "../repositories/GoalRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";

import { AuthService } from "../services/AuthService";
import { UploadService } from "../services/UploadService";
import { RecordingService } from "../services/RecordingService";
import { AnalysisService } from "../services/AnalysisService";
import { DashboardService } from "../services/DashboardService";
import { GoalService } from "../services/GoalService";
import { UserService } from "../services/UserService";
import { NotificationService } from "../services/NotificationService";

import { AuthController } from "../controllers/authController";
import { RecordingController } from "../controllers/recordingController";
import { AnalysisController } from "../controllers/analysisController";
import { GoalController } from "../controllers/goalController";
import { DashboardController } from "../controllers/dashboardController";
import { UserController } from "../controllers/userController";
import { NotificationController } from "../controllers/notificationController";

/**
 * Inversion of Control (IoC) Container / Composition Root
 * Wires repositories, services, and controllers with Dependency Injection
 */
export class DependencyContainer {
  // Repositories
  public readonly userRepository: UserRepository;
  public readonly recordingRepository: RecordingRepository;
  public readonly analysisRepository: AnalysisRepository;
  public readonly goalRepository: GoalRepository;
  public readonly notificationRepository: NotificationRepository;

  // Services
  public readonly authService: AuthService;
  public readonly uploadService: UploadService;
  public readonly recordingService: RecordingService;
  public readonly analysisService: AnalysisService;
  public readonly dashboardService: DashboardService;
  public readonly goalService: GoalService;
  public readonly userService: UserService;
  public readonly notificationService: NotificationService;

  // Controllers
  public readonly authController: AuthController;
  public readonly recordingController: RecordingController;
  public readonly analysisController: AnalysisController;
  public readonly goalController: GoalController;
  public readonly dashboardController: DashboardController;
  public readonly userController: UserController;
  public readonly notificationController: NotificationController;

  constructor() {
    // 1. Initialize Repositories
    this.userRepository = new UserRepository();
    this.recordingRepository = new RecordingRepository();
    this.analysisRepository = new AnalysisRepository();
    this.goalRepository = new GoalRepository();
    this.notificationRepository = new NotificationRepository();

    // 2. Initialize Services with injected Repositories
    this.authService = new AuthService(this.userRepository);
    this.uploadService = new UploadService(this.recordingRepository);
    this.recordingService = new RecordingService(this.recordingRepository, this.uploadService);
    this.analysisService = new AnalysisService(
      this.analysisRepository,
      this.recordingRepository,
      this.userRepository
    );
    this.dashboardService = new DashboardService(
      this.userRepository,
      this.recordingRepository,
      this.analysisRepository,
      this.goalRepository
    );
    this.goalService = new GoalService(this.goalRepository);
    this.userService = new UserService(this.userRepository);
    this.notificationService = new NotificationService(this.notificationRepository);

    // 3. Initialize Controllers with injected Services
    this.authController = new AuthController(this.authService);
    this.recordingController = new RecordingController(
      this.uploadService,
      this.recordingRepository,
      this.analysisService,
      this.recordingService
    );
    this.analysisController = new AnalysisController(this.analysisService);
    this.goalController = new GoalController(this.goalService);
    this.dashboardController = new DashboardController(this.dashboardService);
    this.userController = new UserController(this.userService);
    this.notificationController = new NotificationController(this.notificationService);
  }
}

// Global container instance
export const container = new DependencyContainer();
