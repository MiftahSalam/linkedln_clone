import {
  Controller,
  Post,
  Get,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  Put,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { UpdateResult } from 'typeorm';
import { JwtGuard } from '../guards/jwt.guard';
import {
  isFileExtensionSafe,
  removeFile,
  saveImageToStorage,
} from '../helpers/image.storage';
import { FriendRequest, FriendRequest_Status } from '../models/friend-request.interface';
import { User } from '../models/user.class';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: Request,
  ): Observable<{ modifiedFileName: string } | { error: string }> {
    const filename = file?.filename;

    if (!filename) return of({ error: 'File must be a image file' });

    const imagesFolderPath = join(process.cwd(), 'images');
    const fullImagePath = join(imagesFolderPath + '/' + file.filename);
    // console.log("auth-userController-uploadImage imagesFolderPath",imagesFolderPath, "fullImagePath",fullImagePath);

    return isFileExtensionSafe(fullImagePath).pipe(
      switchMap((isFileLegit: boolean) => {
        if (isFileLegit) {
          if (req['user']) {
            const userId = req['user'].id;
            return this.userService.updateUserImageById(userId, filename).pipe(
              switchMap(() => 
                of({
                  modifiedFileName: file.filename,
                })
              )
            );
          }
          removeFile(fullImagePath);
          return of({ error: 'No user' });
        }
        removeFile(fullImagePath);
        return of({ error: 'File content does not match extension' });
      }),
    );
  }

  @UseGuards(JwtGuard)
  @Get('image')
  findImage(@Request() req, @Res() res): Observable<Object> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: './images' }))
      })
    );
  }

  @UseGuards(JwtGuard)
  @Get('image-name')
  findUserImageByName(@Request() req): Observable<{imageName: string}> {
    const userId = req.user.id;
    return this.userService.findImageNameByUserId(userId).pipe(
      switchMap((imageName: string) => {
        return of({ imageName });
      })
    )
  }

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(@Param('userId') userStringId: string): Observable<User> {
    const userId = parseInt(userStringId);
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  friendRequest(
    @Param('receiverId') receiverStringId: string,
    @Request() req): Observable<FriendRequest | { error: string }> {
    const receiverId = parseInt(receiverStringId);
      
    return this.userService.sendFriendRequest(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequestStatus(
    @Param('receiverId') receiverStringId: string,
    @Request() req
  ): Observable<{ status: FriendRequest_Status}> {
    const receiverId = parseInt(receiverStringId);

    return this.userService.getFriendRequestStatus(receiverId, req.user).pipe(
      switchMap((frienRequestStatus: FriendRequest_Status) => { 
        return of( {status: frienRequestStatus}); 
      }));
  }

  @UseGuards(JwtGuard)
  @Put('friend-request/response/:friendRequestId')
  responseToFriendRequest(
    @Param('friendRequestId') friendRequestStringId: string,
    @Body() statusResponse: { status: FriendRequest_Status }
  ): Observable<{ status: FriendRequest_Status }> {
    const friendRequestId = parseInt(friendRequestStringId);
    
    return this.userService.responseToFriendRequest(statusResponse.status,friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) =>{
        return of({ status: friendRequest.status });
      })
    );
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/received-requests')
  getFriendRequestFromRecipient(@Request() req): Observable<{ status: FriendRequest_Status }[]> {
    return this.userService.getFriendRequestFromRecipient(req.user)
  }

  @UseGuards(JwtGuard)
  @Get("friends/my")
  getFriends(@Request() req): Observable<User[]>{
    return this.userService.getFriends(req.user);
  }
}
